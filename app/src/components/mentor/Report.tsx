import axios from "axios";
import { useState, useEffect } from "react";


const StudentMentoringRecord = () => {
  const [student, setStudent] = useState<Student>({} as Student);

  const fetchStudentById = async (studentId: string) => {
    try {
      console.log(studentId);
      const res = await axios.get(
        `http://localhost:8080/students/srNo/${studentId}`
      );
      console.log(res.data);
      setStudent(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudentById("CA242711");
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <table>
        <tr>
          <td width="80%">
            <h1>JSS Science and Technology University</h1>
            <h2>Student Mentoring and Performance Record</h2>
          </td>
          <td width="20%">
            <img src="jsslogo.jpg" alt="JSS Logo" width="90%" />
          </td>
        </tr>
      </table>

      {/* Personal Profile */}
      <div
        className="section-title"
        style={{ fontWeight: "bold", marginTop: "20px", marginBottom: "10px" }}
      >
        I. Personal Profile
      </div>
      <table>
        <tr>
          <td>Name of the Student</td>
          <td>{student.name}</td>
          <td
            rowSpan={9}
            className="profile-pic"
            style={{
              border: "1px solid black",
              width: "120px",
              height: "150px",
              textAlign: "center",
              lineHeight: "150px",
              fontSize: "12px",
              color: "gray",
            }}
          >
            Photo
          </td>
        </tr>
        <tr>
          <td>Year of Admission</td>
          <td>{student.admissionYear}</td>
        </tr>
        <tr>
          <td>USN</td>
          <td>{student.usn}</td>
        </tr>
        <tr>
          <td>CET/COMEDK/Diploma CET Ranking</td>
          <td>
            {student.entranceExamRank ? student.entranceExamRank.rank : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Date of Birth</td>
          <td>{student.dob}</td>
        </tr>
        <tr>
          <td>Permanent Address</td>
          <td>{student.permanentAddress}</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>{student.height}</td>
        </tr>
        <tr>
          <td>Weight</td>
          <td>{student.weight}</td>
        </tr>
        <tr>
          <td>Blood Group</td>
          <td>{student.bloodGroup}</td>
        </tr>
        <tr>
          <td>Mobile Number - Student</td>
          <td>{student.phone}</td>
        </tr>
        <tr>
          <td>Email ID - Student</td>
          <td>{student.email}</td>
        </tr>
        <tr>
          <td>Hostellite/Day Scholar</td>
          <td>
            {student.residentType === "Localite" ? "Day Scholar" : "Hostellite"}
          </td>
        </tr>
      </table>

      {/* Family Profile */}
      <div className="section-title">II. Family Profile</div>
      <table>
        <tr>
          <td>Father's Name</td>
          <td>{"  "}</td>
        </tr>
        <tr>
          <td>Father's Occupation and Address</td>
          <td>{student.father.occupation}</td>
        </tr>
        <tr>
          <td>Father's Education</td>
          <td>{student.father.education}</td>
        </tr>
        <tr>
          <td>Father's Mobile Number</td>
          <td>{student.father.phone}</td>
        </tr>
        <tr>
          <td>Father's Email ID</td>
          <td>{"no@gmail.com"}</td>
        </tr>
        <tr>
          <td>Mother's Name</td>
          <td>{student.mother.name}</td>
        </tr>
        <tr>
          <td>Mother's Occupation</td>
          <td>{student.mother.occupation}</td>
        </tr>
        <tr>
          <td>Mother's Education</td>
          <td>{student.mother.education}</td>
        </tr>
        <tr>
          <td>Mother's Mobile Number</td>
          <td>{student.mother.phone}</td>
        </tr>
        <tr>
          <td>Mother's Email ID</td>
          <td>{student.mother.email}</td>
        </tr>
        <tr>
          <td>Number of Siblings</td>
          <td>
            {student.siblings.length > 0 ? student.siblings.length : "None"}
          </td>
          {student.siblings.map((sibling, index) => (
            <tr key={index}>
              <td>Relation</td>
              <td>{sibling.relationType}</td>
              <td>Name</td>
              <td>{sibling.name}</td>
              <td>Occupation</td>
              <td>{sibling.occupation}</td>
            </tr>
          ))}
        </tr>
      </table>

      {/* Academic Profile */}
      <div className="section-title">III. Academic Profile</div>
      <table>
        <tr>
          <td>Local Residence</td>
          <td>{student.presentAddress}</td>
        </tr>
        <tr>
          <td>For Hostellites: Local Guardian's Name (LG)</td>
          <td>
            {student.localGuardianDetails
              ? student.localGuardianDetails
              : "N/A"}
          </td>
        </tr>
        <tr>
          <td>Address</td>
          <td>
            {student.localGuardianDetails
              ? student.localGuardianDetails
              : "N/A"}
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td>Name of the Previous Institution</td>
          <td>{student.previousInstitutionDetails}</td>
        </tr>
        <tr>
          <td>Previous Course Completed</td>
          <td>{student.previousCourse}</td>
        </tr>
        <tr>
          <td>Medium of Instruction</td>
          <td>{student.mediumOfInstruction}</td>
        </tr>
      </table>

      {/* Achievements */}
      <div className="section-title">Achievements</div>
      <table>
        <thead>
          <tr>
            <th>Previous Institution</th>
            <th>Activity</th>
            <th>Prize Details</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
};

export default StudentMentoringRecord;
