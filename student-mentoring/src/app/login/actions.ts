"use server";

export async function signin(data: {
  role: string;
  userid: string;
  password: string;
}) {
  try {
    let endpoint = '';
    let requestData = {};
    
    if (data.role === "student") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/students/login`;
      requestData = {
        srNo: data.userid,
        password: data.password
      };
    } else if (data.role === "mentor") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/mentors/login`;
      requestData = {
        empId: data.userid,
        password: data.password
      };
    } else if (data.role === "admin") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/admin/login`;
      requestData = {
        adminId: data.userid,
        password: data.password
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    return { 
      success: true, 
      user: result.student || result.mentor || result.admin,
      role: data.role 
    };
    
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed. Please check your credentials.");
  }
}

export async function signout() {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('student');
    localStorage.removeItem('mentor');
    localStorage.removeItem('admin');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  }
  
  // Redirect to login
  const { redirect } = await import('next/navigation');
  redirect('/login');
}