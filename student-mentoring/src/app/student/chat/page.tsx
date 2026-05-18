import { Box, Typography, Container } from "@mui/material";
import StudentChat from "./StudentChat";

export default function StudentChatPage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "100vh",
          py: 4,
          px: { xs: 2, md: 4 },
          background: `
            linear-gradient(135deg, 
              rgba(248, 250, 252, 0.95) 0%, 
              rgba(241, 245, 249, 0.95) 100%
            )
          `,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
           
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
            
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              color: "#888", 
              maxWidth: "600px", 
              mx: "auto" 
            }}
          >
      
          </Typography>
        </Box>

        {/* Chat Component */}
        <Box
          sx={{
            maxWidth: "900px",
            mx: "auto",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            overflow: "hidden",
            border: "1px solid rgba(99, 102, 241, 0.1)",
          }}
        >
          <StudentChat />
        </Box>

        {/* API Info */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="#6366f1">
           
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>GET /chat/messages</strong> - Get all messages
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>POST /chat/send</strong> - Send message (body: {"{"}senderType, content{"}"})
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>PUT /chat/read</strong> - Mark messages as read (body: {"{"}readerType{"}"})
              </Typography>
            </li>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}