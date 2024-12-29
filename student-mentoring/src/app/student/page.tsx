"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [formValues, setFormValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(false);
  const session = useSession();
  useEffect(() => {
    setLoading(true);
    if (!session) return;
    if (session.status === "loading") return;
    const fetchData = async () => {
      // Fetch student data from localStorage
      const studId = session.data?.user.id;
      const res = await fetch(`http://localhost:8080/students/${studId}`);
      const data = await res.json();
      setFormValues(data);
    };

    fetchData();
    setLoading(false);
  }, [session]);

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
      // const response = await axios.put(
      //   `http://localhost:8080/students/${studID}`,
      //   formValues
      // );
      setLoading(true);
      const studId = session.data?.user.id;

      const res = await fetch(`http://localhost:8080/students/${studId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      console.log("Student data updated successfully:", data);
      setLoading(false);
      toast.success("Student data updated successfully");
      setFormValues(data);
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: "100vh",
          padding: 3,
          background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
        }}
      >
        <Paper
          elevation={5}
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 700,
            borderRadius: 3,
            boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Profile Title */}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#3f51b5",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
              marginBottom: 4,
            }}
          >
            Student Profile
          </Typography>

          <CircularProgress
            size={100}
            thickness={2}
            sx={{ display: "block", margin: "auto" }}
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: 3,
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
      }}
    >
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
            color: "#3f51b5",
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
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#3f51b5" }}
            >
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
                    ? formatDate(
                        formValues[field as keyof typeof formValues]?.toString()
                      )
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
            />
            <TextField
              label="Email"
              name="email"
              value={formValues.email || ""}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#3f51b5" }}
            >
              Parent Information
            </Typography>
            {["father", "mother"].map((parent) => (
              <Box key={parent} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#3f51b5", mb: 2 }}
                >
                  {parent.charAt(0).toUpperCase() + parent.slice(1)}
                </Typography>
                {[
                  "name",
                  "occupation",
                  "workAddress",
                  "education",
                  "phone",
                  "email",
                ].map((field) => (
                  <TextField
                    key={field}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={
                      ((formValues[parent as keyof FormValues] as Record<
                        string,
                        any
                      >) || {})[field] || ""
                    }
                    onChange={(e) => {
                      const newParentData = {
                        ...((formValues[parent as keyof FormValues] as Record<
                          string,
                          any
                        >) || {}),
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
                    disabled={field === "email" || field === "phone"}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#3f51b5" }}
            >
              Academic Profile
            </Typography>
            {[
              {
                label: "Previous Institution",
                field: "previousInstitutionDetails",
              },
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
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#3f51b5" }}
            >
              Achievements
            </Typography>
            {formValues.achievements && formValues.achievements.length > 0 ? (
              formValues.achievements.map((achievement, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  {["domain", "activity", "prizeDetails", "institution"].map(
                    (field) => (
                      <TextField
                        key={field}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={
                          achievement[field as keyof typeof achievement] || ""
                        }
                        onChange={(e) => {
                          const updatedAchievements = [
                            ...(formValues.achievements || []),
                          ];
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
                    )
                  )}
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
                    achievements: [
                      ...(prev.achievements || []),
                      {
                        domain: "",
                        activity: "",
                        prizeDetails: "",
                        institution: "",
                      },
                    ],
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
    </Box>
  );
};

export default StudentDashboard;
