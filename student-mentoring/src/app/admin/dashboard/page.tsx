'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  FiUpload,
  FiCheckCircle,
  FiUsers,
  FiLogOut,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-lg text-gray-600">Manage student marks, verifications, and mentorship</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Upload Marksheet */}
          <Card
            title="Upload Marksheet"
            description="Upload new student marksheets in bulk or individually"
            icon={<FiUpload size={24} />}
            bg="bg-blue-100"
            color="text-blue-600"
            buttonColor="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/admin/upload')}
          />

          {/* Verify Marks */}
          <Card
            title="Verify Marks"
            description="Review and verify student mark verification requests"
            icon={<FiCheckCircle size={24} />}
            bg="bg-green-100"
            color="text-green-600"
            buttonColor="bg-green-600 hover:bg-green-700"
            onClick={() => router.push('/admin/verifymarks')}
          />

          {/* Assign Mentee */}
          <Card
            title="Assign Mentee"
            description="Assign students to mentors for academic guidance"
            icon={<FiUsers size={24} />}
            bg="bg-purple-100"
            color="text-purple-600"
            buttonColor="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/assignmentor123')}
          />

          {/* Query Report */}
          <Card
            title="Query Report"
            description="Generate reports based on student queries and data analysis"
            icon={<FiUsers size={24} />}
            bg="bg-purple-100"
            color="text-purple-600"
            buttonColor="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/admin/report')}
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Pending Verifications" value="12" color="text-blue-600" bg="bg-blue-50" />
            <Stat label="Approved Today" value="8" color="text-green-600" bg="bg-green-50" />
            <Stat label="Uploads Today" value="24" color="text-yellow-600" bg="bg-yellow-50" />
            <Stat label="Mentee Assignments" value="15" color="text-purple-600" bg="bg-purple-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable Card component
function Card({ title, description, icon, bg, color, buttonColor, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg ${bg} ${color} mr-4`}>
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex justify-end">
          <button className={`px-4 py-2 text-white rounded-lg transition ${buttonColor}`}>
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable Stat Box
function Stat({ label, value, color, bg }: any) {
  return (
    <div className={`${bg} p-4 rounded-lg`}>
      <p className={`text-sm ${color}`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
