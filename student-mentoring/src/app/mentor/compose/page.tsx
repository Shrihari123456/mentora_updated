// app/mentor/email/compose/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Student {
  _id: string;
  name: string;
  srNo: string;
  email: string;
}

export default function ComposeEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [attachments, setAttachments] = useState<File[]>([]);

  const mentorEmpId = session?.user?.userid || 'MNT001';

  // Check if replying to an email
  const replyTo = searchParams.get('replyTo');
  const replySubject = searchParams.get('subject');

  useEffect(() => {
    if (replySubject) {
      setSubject(`Re: ${replySubject}`);
    }
  }, [replySubject]);

  // Fetch students for autocomplete
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students?mentorEmpId=${mentorEmpId}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mentorEmpId) {
      fetchStudents();
    }
  }, [mentorEmpId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Extract student srNo from input (format: "Name (SRNO)" or just SRNO)
    let studentSrNo = to.trim();
    const match = to.match(/\(([^)]+)\)/);
    if (match) {
      studentSrNo = match[1];
    }

    // Validate student exists
    const student = students.find(s => s.srNo === studentSrNo);
    if (!student) {
      setError('Student not found. Please enter a valid student SR No.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Prepare form data for attachments
      const formData = new FormData();
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      // Send email
      const res = await fetch(`${API_BASE_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderType: 'mentor',
          senderId: mentorEmpId,
          recipientId: studentSrNo,
          subject,
          body,
          priority,
          parentMessageId: replyTo || undefined
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/mentor/email');
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              Compose Email
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSend}
              disabled={sending}
              sx={{
                background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #303f9f 0%, #3949ab 100%)',
                },
              }}
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Email sent successfully! Redirecting...
          </Alert>
        )}

        {/* Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* To Field */}
          <TextField
            label="To"
            placeholder="Enter student SR No. or name"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            fullWidth
            helperText="Example: UU246020 or John Doe (UU246020)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="text.secondary">To:</Typography>
                </InputAdornment>
              ),
            }}
          />

          {/* Student Suggestions */}
          {to.length > 1 && students.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Students:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {students
                  .filter(student => 
                    student.name.toLowerCase().includes(to.toLowerCase()) ||
                    student.srNo.toLowerCase().includes(to.toLowerCase())
                  )
                  .slice(0, 5)
                  .map(student => (
                    <Chip
                      key={student._id}
                      label={`${student.name} (${student.srNo})`}
                      onClick={() => setTo(`${student.name} (${student.srNo})`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
              </Box>
            </Paper>
          )}

          {/* Subject */}
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
          />

          {/* Priority */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Priority:
            </Typography>
            <Chip
              label="Low"
              onClick={() => setPriority('low')}
              color={priority === 'low' ? 'success' : 'default'}
              variant={priority === 'low' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip
              label="Normal"
              onClick={() => setPriority('normal')}
              color={priority === 'normal' ? 'primary' : 'default'}
              variant={priority === 'normal' ? 'filled' : 'outlined'}
              size="small"
            />
            <Chip
              label="High"
              onClick={() => setPriority('high')}
              color={priority === 'high' ? 'error' : 'default'}
              variant={priority === 'high' ? 'filled' : 'outlined'}
              size="small"
              icon={<PriorityHighIcon />}
            />
          </Box>

          <Divider />

          {/* Body */}
          <TextField
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            fullWidth
            multiline
            rows={12}
            placeholder="Type your message here..."
          />

          {/* Attachments */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Attachments:
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  size="small"
                >
                  Add Files
                </Button>
              </label>
            </Box>

            {attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                    onDelete={() => removeAttachment(index)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}