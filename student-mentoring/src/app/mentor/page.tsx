import { Grid, Box, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";
import React from "react";
import ListAltIcon from "@mui/icons-material/ListAlt"; // For "View All Students"
import GroupIcon from "@mui/icons-material/Group"; // For "View Mentees"
import PersonIcon from "@mui/icons-material/Person"; // For "Mentor Profile"

const Page = () => {
  // Reusable icon style for better consistency
  const iconStyle = {
    fontSize: 40,
    color: "#3f51b5", // Primary color for icons
  };

  const cardData = [
    {
      title: "Explore the Full Student Directory",
      description:
        "Browse and manage the complete list of students and their details.",
      path: "/mentor/allstudents",
      icon: <ListAltIcon sx={iconStyle} />, // Consistent icon style
    },
    {
      title: "Manage Your Mentees",
      description: "View and track the progress of your assigned mentees.",
      path: "/mentor/mentees",
      icon: <GroupIcon sx={iconStyle} />, // Consistent icon style
    },
    {
      title: "Edit Your Mentor Profile",
      description: "Update your profile details and areas of expertise.",
      path: "/mentor/profile",
      icon: <PersonIcon sx={iconStyle} />, // Consistent icon style
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to top, #e0eafc, #cfdef3)",
        py: 5,
      }}
    >
      {/* Welcome Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#3f51b5",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.2)",
          mb: 1, // Reduced margin to bring subtitle closer
        }}
      >
        Welcome to Your Dashboard, Mentor!
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#666666", // Lighter color for a subtler look
          fontWeight: "normal", // Reduced boldness
          mb: 5, // Reduced margin to bring subtitle closer to the title
          fontSize: "1rem", // Slightly smaller size
        }}
      >
        Click on any of the options below to start navigating through your
        mentor dashboard.
      </Typography>

      {/* Grid of Cards */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ width: "80%", mx: "auto" }}
      >
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={12} md={6} key={index}>
            <Link href={card.path} passHref>
              <Card
                sx={{
                  height: "205px", // Moderate height for all screen sizes
                  width: "100%", // Full width within the grid container
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: 3,
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.3)",
                  },
                  background:
                    "linear-gradient(135deg, #f7f8fa 30%, #e6eaf0 100%)",
                  borderRadius: "16px", // Rounded corners
                  overflow: "hidden",

                  padding: 2,
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  {/* Icon at the top */}
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "#3f51b5",
                      fontSize: "1.1rem", // Slightly larger title font
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#757575",
                      mt: 1,
                      fontSize: "0.9rem", // Adjusted font size
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Page;
