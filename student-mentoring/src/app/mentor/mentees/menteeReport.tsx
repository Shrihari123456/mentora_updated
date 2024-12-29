import { CSS } from "@fileforge/react-print";
import Image from "next/image";

function MenteeReport({ student }: { student: Student }) {
  const studentName = student.name;
  const admissionYear = student.admissionYear;
  const usn = student.usn;
  const ranking = student.entranceExamRank
    ? student.entranceExamRank.rank
    : "N/A";
  const dob = student.dob;
  const address = student.permanentAddress;
  const height = student.height;
  const weight = student.weight;
  const bloodGroup = student.bloodGroup;
  const studentMobile = student.phone;
  const studentEmail = student.email;
  const hostellite =
    student.residentType === "Localite" ? "Day Scholar" : "Hostellite";

  const fatherName = student.father.name;
  const fatherOccupation = student.father.occupation;
  const fatherEducation = student.father.education;
  const fatherMobile = student.father.phone;
  const fatherEmail = student.father.email;

  const motherName = student.mother.name;
  const motherOccupation = student.mother.occupation;
  const motherEducation = student.mother.education;
  const motherMobile = student.mother.phone;
  const motherEmail = student.mother.email;

  const siblings = student.siblings.length;

  const residenceType = student.residentType;
  const guardianName = student.localGuardianDetails ?? "N/A";
  const presentAddress = student.presentAddress;

  const prevInstitution = student.previousInstitutionDetails;
  const prevCourse = student.previousCourse;
  const medium = student.mediumOfInstruction;

  return (
    <div>
      <CSS>
        {`
          .body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table,
          th,
          td {
            border: 1px solid black;
          }
          th,
          td {
            padding: 8px;
            text-align: left;
          }
          .section-title {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .profile-pic {
            border: 1px solid black;
            width: 120px;
            height: 150px;
            text-align: center;
            line-height: 150px;
            font-size: 12px;
            color: gray;
          }
          
          `}
      </CSS>
      <div className="body">
        <table>
          <tr>
            <td width="80%">
              <h1>JSS Science and Technology University</h1>
              <h2>Student Mentoring and Performance Record</h2>
            </td>
            <td width="20%">
              <Image
                src="https://jssstuniv.in/assets/img/logo/jssstulogo.png"
                alt="JSSSTU Logo"
                width={300}
                height={150}
              />
            </td>
          </tr>
        </table>

        <div className="section-title">I. Personal Profile</div>
        <table>
          <tr>
            <td>Name of the Student</td>
            <td>{studentName}</td>
            <td rowSpan={12} className="profile-pic">
              <Image
                src={student.photo}
                alt="Student Photo"
                width={200}
                height={200}
              />
            </td>
          </tr>
          <tr>
            <td>Year of Admission</td>
            <td>{admissionYear}</td>
          </tr>
          <tr>
            <td>USN</td>
            <td>{usn}</td>
          </tr>
          <tr>
            <td>CET/COMEDK/Diploma CET Ranking</td>
            <td>{ranking}</td>
          </tr>
          <tr>
            <td>Date of Birth</td>
            <td>{dob}</td>
          </tr>
          <tr>
            <td>Permanent Address</td>
            <td>{address}</td>
          </tr>
          <tr>
            <td>Height</td>
            <td>{height}</td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>{weight}</td>
          </tr>
          <tr>
            <td>Blood Group</td>
            <td>{bloodGroup}</td>
          </tr>
          <tr>
            <td>Mobile Number - Student</td>
            <td>{studentMobile}</td>
          </tr>
          <tr>
            <td>Email ID - Student</td>
            <td>{studentEmail}</td>
          </tr>
          <tr>
            <td>Hostellite/Day Scholar</td>
            <td>{hostellite}</td>
          </tr>
        </table>

        <div className="section-title">II. Family Profile</div>
        <table>
          <tr>
            <td>Father's Name</td>
            <td>{fatherName}</td>
          </tr>
          <tr>
            <td>Father's Occupation and Address</td>
            <td>{fatherOccupation}</td>
          </tr>
          <tr>
            <td>Father's Education</td>
            <td>{fatherEducation}</td>
          </tr>
          <tr>
            <td>Father's Mobile Number</td>
            <td>{fatherMobile}</td>
          </tr>
          <tr>
            <td>Father's Email ID</td>
            <td>{fatherEmail}</td>
          </tr>
          <tr>
            <td>Mother's Name</td>
            <td>{motherName}</td>
          </tr>
          <tr>
            <td>Mother's Occupation</td>
            <td>{motherOccupation}</td>
          </tr>
          <tr>
            <td>Mother's Education</td>
            <td>{motherEducation}</td>
          </tr>
          <tr>
            <td>Mother's Mobile Number</td>
            <td>{motherMobile}</td>
          </tr>
          <tr>
            <td>Mother's Email ID</td>
            <td>{motherEmail}</td>
          </tr>
          <tr>
            <td>Number of Siblings</td>
            <td>{siblings}</td>
          </tr>
          <tr>
            <td colSpan={2} className="section-title">
              Sibling Details
            </td>
          </tr>
          {student.siblings.length > 0 &&
            student.siblings.map((sibling) => {
              return (
                <>
                  <tr>
                    <td>Name</td>
                    <td>{sibling.name}</td>
                  </tr>
                  <tr>
                    <td>Relation</td>
                    <td>{sibling.relationType}</td>
                  </tr>
                  <tr>
                    <td>Occupation</td>
                    <td>{sibling.occupation}</td>
                  </tr>
                </>
              );
            })}
          {student.siblings.length === 0 && (
            <tr>
              <td colSpan={2}>None</td>
            </tr>
          )}
          <tr>
            <td>Local Residence</td>
            <td>{residenceType}</td>
          </tr>
          <tr>
            <td>For Hostellites: Local Guardian's Name (LG)</td>
            <td>{guardianName}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>{presentAddress}</td>
          </tr>
        </table>

        <div className="section-title">III. Academic Profile</div>
        <table>
          <tr>
            <td>Name of the Previous Institution</td>
            <td>{prevInstitution}</td>
          </tr>
          <tr>
            <td>Previous Course Completed</td>
            <td>{prevCourse}</td>
          </tr>
          <tr>
            <td>Medium of Instruction</td>
            <td>{medium}</td>
          </tr>
        </table>

        <div className="section-title">Achievements</div>
        <table>
          <tr>
            <th>Category</th>
            <th>Previous Institution</th>
            <th>Activity</th>
            <th>Prize Details</th>
          </tr>
          {student.achievements.map((achievement) => {
            return (
              <tr>
                <td>{achievement.domain}</td>
                <td>{achievement.institution}</td>
                <td>{achievement.activity}</td>
                <td>{achievement.prizeDetails}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}

export default MenteeReport;
