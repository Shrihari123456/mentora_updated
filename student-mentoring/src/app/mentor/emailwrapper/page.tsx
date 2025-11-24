// src/app/mentor/EmailButtonWrapper.tsx
// OR src/components/EmailButtonWrapper.tsx
'use client';

import { useState } from "react";
import { Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
// import MentorEmailModal from "./mentoremail/page"; // Adjust path as needed
import MentorEmailModal from "../mentoremail/page";

export default function EmailButtonWrapper({ 
  mentorId, 
  mentorName 
}: { 
  mentorId: string; 
  mentorName: string 
}) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EmailIcon />}
        onClick={() => setIsEmailModalOpen(true)}
        sx={{
          backgroundColor: "#3f51b5",
          color: "white",
          px: 4,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
          textTransform: "none",
          boxShadow: 3,
          "&:hover": {
            backgroundColor: "#303f9f",
            boxShadow: 6,
          },
        }}
      >
        Email My Mentees
      </Button>

      <MentorEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        mentorId={mentorId}
        mentorName={mentorName}
      />
    </>
  );
}