import { Box, Typography, Container } from "@mui/material";
import MentorChat from "./MentorChat";

export default function MentorChatPage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "100vh",
          py: 4,
          px: { xs: 2, md: 4 },
          background: `
            linear-gradient(to top, rgba(224, 234, 252, 0.95), rgba(207, 222, 243, 0.95))
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Mentor Chat (Hardcoded)
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              color: "#666", 
              maxWidth: "600px", 
              mx: "auto",
              mb: 1 
            }}
          >
            Chat between MNT001 (Mentor) and CA242711 (Student)
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              color: "#888", 
              maxWidth: "600px", 
              mx: "auto" 
            }}
          >
            Simple hardcoded chat solution for testing
          </Typography>
        </Box>

        {/* Chat Component */}
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            overflow: "hidden",
            border: "1px solid rgba(63, 81, 181, 0.1)",
          }}
        >
          <MentorChat />
        </Box>

        {/* API Info */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="#3f51b5">
            API Endpoints Being Called:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>GET /chat/messages</strong> - Get all messages (hardcoded to MNT001 & CA242711)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>POST /chat/send</strong> - Send message (body: {"{"}"senderType": "mentor", "content": "your message"{"}"})
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>PUT /chat/read</strong> - Mark messages as read (body: {"{"}"readerType": "mentor"{"}"})
              </Typography>
            </li>
          </Box>
          <Typography variant="caption" color="text.secondary">
            All values are hardcoded: Mentor: MNT001, Student: CA242711
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}