import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Tabs, Tab, Button } from "@mui/material";
import axios from "axios";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  interface FormValues {
    name?: string;
    admissionYear?: string;
    srNo?: string;
    usn?: string;
    dob?: string;
    section?: string;
    permanentAddress?: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    residentType?: string;
    phone?: string;
    email?: string;
    father?: {
      name?: string;
      occupation?: string;
      workAddress?: string;
      education?: string;
      phone?: string;
      email?: string;
    };
    mother?: {
      name?: string;
      occupation?: string;
      workAddress?: string;
      education?: string;
      phone?: string;
      email?: string;
    };
    previousInstitutionDetails?: string;
    previousCourse?: string;
    mediumOfInstruction?: string;
    achievements?: {
      domain?: string;
      activity?: string;
      prizeDetails?: string;
      institution?: string;
    }[];
  }

  const [formValues, setFormValues] = useState<FormValues>({ achievements: [] });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch student data from localStorage
      const data = localStorage.getItem("auth");
      if (data) {
        const parsedData = JSON.parse(data);
        setFormValues(parsedData.userDetails || {});
      } else {
        console.error("No student data found in localStorage.");
      }
    };

    fetchData();
  }, []);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("auth") || "{}");
      const selectedStudent = data.userDetails;
        const studID = selectedStudent?._id;
        
      const response = await axios.put(
        `http://localhost:8080/students/${studID}`,
        formValues
      );

      if (response.status === 200) {
          console.log("Student data updated successfully.");
          const updatedData = {
        role: "student",
        userDetails: formValues,
      };
      localStorage.setItem("auth", JSON.stringify(updatedData));
      }

      
    } catch (error) {
      console.error("Error updating student data:", error);
    }
  };

  if (!formValues) {
    return (
      <Typography sx={{ color: "red", textAlign: "center", mt: 4 }}>
        No student data found.
      </Typography>
    );
    }
    const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ""; // Return empty string if no date is provided
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Format as "yyyy-MM-dd"
};

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "auto",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: 600,
          borderBottom: "1px solid #ddd",
          paddingBottom: "16px",
        }}
      >
        Student Details
      </Typography>
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            padding: "12px 16px",
            fontWeight: 500,
          },
          "& .MuiTabs-flexContainer": {
            borderBottom: "1px solid #ddd",
          },
        }}
      >
        <Tab label="Personal Details" />
        <Tab label="Parents" />
        <Tab label="Academic Profile" />
        <Tab label="Achievements" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Personal Information
          </Typography>
         {[
  { label: "Name", field: "name" },
  { label: "Admission Year", field: "admissionYear" },
  { label: "SR Number", field: "srNo" },
  { label: "USN", field: "usn" },
  { label: "DOB", field: "dob", type: "date" },
  { label: "Section", field: "section" },
  { label: "Permanent Address", field: "permanentAddress" },
  { label: "Height (cm)", field: "height" },
  { label: "Weight (kg)", field: "weight" },
  { label: "Blood Group", field: "bloodGroup" },
  { label: "Resident Type", field: "residentType" },
].map(({ label, field, type = "text" }) => (
  <TextField
    key={field}
    label={label}
    name={field}
    value={
      type === "date"
        ? formatDate(formValues[field as keyof typeof formValues]?.toString())
        : formValues[field as keyof typeof formValues] || ""
    }
    onChange={handleInputChange}
    variant="outlined"
    fullWidth
    sx={{ mb: 2 }}
    type={type}
  />
))}

          <TextField
            label="Phone"
            name="phone"
            value={formValues.phone || ""}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            disabled
          />
          <TextField
            label="Email"
            name="email"
            value={formValues.email || ""}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            disabled
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Parent Information
          </Typography>
          {["father", "mother"].map((parent) => (
            <Box key={parent} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {parent.charAt(0).toUpperCase() + parent.slice(1)}
              </Typography>
              {["name", "occupation", "workAddress", "education", "phone", "email"].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={((formValues[parent as keyof FormValues] as Record<string, any>) || {})[field] || ""}
                  onChange={(e) => {
                    const newParentData = {
                      ...(formValues[parent as keyof FormValues] as Record<string, any> || {}),
                      [field]: e.target.value,
                    };
                    setFormValues((prev) => ({
                      ...prev,
                      [parent]: newParentData,
                    }));
                  }}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Academic Profile
          </Typography>
          {[
            { label: "Previous Institution", field: "previousInstitutionDetails" },
            { label: "Previous Course", field: "previousCourse" },
            { label: "Medium of Instruction", field: "mediumOfInstruction" },
          ].map(({ label, field }) => (
            <TextField
              key={field}
              label={label}
              name={field}
              value={formValues[field as keyof FormValues] || ""}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
          ))}
        </Box>
      )}

      {activeTab === 3 && (
  <Box sx={{ px: 2, mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      Achievements
    </Typography>
    {formValues.achievements && formValues.achievements.length > 0 ? (
      formValues.achievements.map((achievement, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          {["domain", "activity", "prizeDetails", "institution"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={achievement[field as keyof typeof achievement] || ""}
              onChange={(e) => {
                const updatedAchievements = [...(formValues.achievements || [])];
                updatedAchievements[index] = {
                  ...updatedAchievements[index],
                  [field]: e.target.value,
                };
                setFormValues((prev) => ({
                  ...prev,
                  achievements: updatedAchievements,
                }));
              }}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
          ))}
        </Box>
      ))
    ) : (
      <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
        No achievements available. You can add new ones below.
      </Typography>
    )}
    <Box>
      <Button
        variant="outlined"
        color="primary"
        onClick={() =>
          setFormValues((prev) => ({
            ...prev,
            achievements: [...(prev.achievements || []), { domain: "", activity: "", prizeDetails: "", institution: "" }],
          }))
        }
        sx={{
          textTransform: "none",
          mt: 2,
          display: "block",
          margin: "auto",
        }}
      >
        Add Achievement
      </Button>
    </Box>
  </Box>
)}


      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            textTransform: "none",
            padding: "8px 24px",
            fontWeight: 500,
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
