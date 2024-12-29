import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const cardData = [
    {
      title: "View All Students",
      description: "Browse the entire list of students.",
      path: "/mentor/students",
    },
    {
      title: "View Mentees",
      description: "See the students assigned as your mentees.",
      path: "/mentor/mentees",
    },
    {
      title: "Assign Mentee",
      description: "Assign mentees to mentors easily.",
      path: "/mentor/assign-mentee",
    },
    {
      title: "Mentor Profile",
      description: "View and update your profile details.",
      path: "/mentor/profile",
    },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        padding: 3,
        bgcolor: "linear-gradient(to right, #3f51b5, #1c39bb)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Welcome Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          marginBottom: 4,
          textShadow: "2px 2px 5px rgba(0,0,0,0.5)",
        }}
      >
        Welcome to Your Dashboard, Mentor!
      </Typography>

      {/* Grid of Cards */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        width={"75%"}
        alignSelf={"center"}
        alignContent={"center"}
      >
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              onClick={() => navigate(card.path)} // Make the entire card clickable
              sx={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 3,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.3)",
                },
                backgroundColor: "#f5f5f5",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#3f51b5" }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#757575", marginTop: 1 }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MentorDashboard;
