// src/app/mentor/page.tsx
// This is a SERVER component (no 'use client')

import { Grid, Box, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";
import React from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { auth } from "@/auth";
 // Import the client component
import EmailButtonWrapper from "./emailwrapper/page";

const Page = async () => {
  const iconStyle = {
    fontSize: 40,
    color: "#3f51b5",
  };
  
  const session = await auth();
  
  // This would typically come from your session/database
  const mentorId = session?.user?.id || "MENTOR_ID_HERE";
  const mentorName = session?.user?.name || "Mentor";

  const cardData = [
    {
      title: "Explore the Full Student Directory",
      description: "Browse and manage the complete list of students and their details.",
      path: "/mentor/allstudents",
      icon: <ListAltIcon sx={iconStyle} />,
    },
    {
      title: "Manage Your Mentees",
      description: "View and track the progress of your assigned mentees.",
      path: "/mentor/mentees",
      icon: <GroupIcon sx={iconStyle} />,
    },
    {
      title: "View Your Mentor Profile",
      description: "View your personal details",
      path: "/mentor/profile",
      icon: <PersonIcon sx={iconStyle} />,
    },
    {
      title: "Mentor Mentee Meet",
      description: "Schedule and manage meetings with your mentees.",
      path: "/mentor/accept",
      icon: <PersonIcon sx={iconStyle} />,
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
          mb: 1,
        }}
      >
        Welcome to Your Dashboard, {mentorName}!
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "#666666",
          fontWeight: "normal",
          mb: 3,
          fontSize: "1rem",
        }}
      >
        Click on any of the options below to start navigating through your mentor dashboard.
      </Typography>

      {/* Email Button - Client Component */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <EmailButtonWrapper mentorId={mentorId} mentorName={mentorName} />
      </Box>

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
                  height: "205px",
                  width: "100%",
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
                  background: "linear-gradient(135deg, #f7f8fa 30%, #e6eaf0 100%)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  padding: 2,
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "#3f51b5",
                      fontSize: "1.1rem",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#757575",
                      mt: 1,
                      fontSize: "0.9rem",
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