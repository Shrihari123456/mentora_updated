interface AuthPayload {
  role: "mentor" | "student";
  id: string; // srNo or empId
  password: string;
}
