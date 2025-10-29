"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { toast } from "sonner"

interface Employee {
  id: number
  name: string
  role: string
  salary: number
  attendance: { date: string; present: boolean }[]
}

interface LeaveRequest {
  id: number
  name: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Ravi Kumar",
      role: "Front Desk",
      salary: 25000,
      attendance: generateAttendance(),
    },
    {
      id: 2,
      name: "Neha Sharma",
      role: "Housekeeping",
      salary: 18000,
      attendance: generateAttendance(),
    },
    {
      id: 3,
      name: "Arjun Mehta",
      role: "Chef",
      salary: 40000,
      attendance: generateAttendance(),
    },
  ])

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 1, name: "Neha Sharma", reason: "Medical leave for 3 days", status: "Pending" },
  ])

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    salary: "",
  })

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [attendanceView, setAttendanceView] = useState(false)
  const [attendanceRange, setAttendanceRange] = useState("7")

  function generateAttendance() {
    const today = new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      return {
        date: date.toISOString().split("T")[0],
        present: Math.random() > 0.2, // 80% chance of being present
      }
    }).reverse()
  }

  const handleSalaryChange = (id: number, salary: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, salary } : e))
    )
  }

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role || !newEmployee.salary) {
      toast.error("Please fill all employee details")
      return
    }

    const emp: Employee = {
      id: employees.length + 1,
      name: newEmployee.name,
      role: newEmployee.role,
      salary: Number(newEmployee.salary),
      attendance: generateAttendance(),
    }

    setEmployees([...employees, emp])
    setNewEmployee({ name: "", role: "", salary: "" })
    toast.success("New employee added successfully!")
  }

  const handleLeaveAction = (id: number, status: "Approved" | "Rejected") => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    )
    toast.success(`Leave ${status}`)
  }

  const handlePrintPolicy = () => {
    const policyText = `
      HR POLICY - RESORT MANAGEMENT
      --------------------------------
      1. Employees must clock in and out daily.
      2. Leave must be applied 2 days in advance.
      3. Salary disbursed every 30 days.
      4. Uniform and hygiene required for all staff.
      5. Misconduct may result in disciplinary action.
      --------------------------------
      Issued by Resort HR Department.
    `
    const printWindow = window.open("", "_blank")
    printWindow!.document.write(`<pre>${policyText}</pre>`)
    printWindow!.print()
  }

  const viewAttendanceData = (employee: Employee) => {
    setSelectedEmployee(employee)
    setAttendanceView(true)
  }

  const getAttendanceChartData = (attendance: Employee["attendance"]) => {
    const range = attendanceRange === "7" ? 7 : 30
    const recent = attendance.slice(-range)
    return recent.map((a) => ({
      date: a.date,
      value: a.present ? 1 : 0,
    }))
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 space-y-8">
      <h1 className="text-3xl font-bold text-center">🏢 HR Management Dashboard</h1>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Name</th>
                <th>Role</th>
                <th>Salary (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b">
                  <td className="p-2">{emp.name}</td>
                  <td>{emp.role}</td>
                  <td>
                    <Input
                      type="number"
                      value={emp.salary}
                      onChange={(e) => handleSalaryChange(emp.id, Number(e.target.value))}
                      className="w-28"
                    />
                  </td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => viewAttendanceData(emp)}>
                      View Attendance
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New Employee */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          />
          <Input
            placeholder="Role"
            value={newEmployee.role}
            onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Salary"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
          />
          <Button onClick={handleAddEmployee}>Add</Button>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.map((req) => (
            <div key={req.id} className="flex justify-between border p-3 rounded-md mb-2">
              <div>
                <p className="font-semibold">{req.name}</p>
                <p className="text-sm">{req.reason}</p>
                <p className="text-xs text-gray-500">Status: {req.status}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleLeaveAction(req.id, "Approved")}>
                  Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleLeaveAction(req.id, "Rejected")}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* HR Policy Section */}
      <Card>
        <CardHeader>
          <CardTitle>HR Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePrintPolicy}>🖨️ Print HR Policy</Button>
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      <Dialog open={attendanceView} onOpenChange={setAttendanceView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Attendance for {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="7" onValueChange={setAttendanceRange}>
            <TabsList className="mb-4">
              <TabsTrigger value="7">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30">Last 30 Days</TabsTrigger>
            </TabsList>
            <TabsContent value="7">
              {selectedEmployee && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getAttendanceChartData(selectedEmployee.attendance)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis ticks={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            <TabsContent value="30">
              {selectedEmployee && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getAttendanceChartData(selectedEmployee.attendance)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis ticks={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
