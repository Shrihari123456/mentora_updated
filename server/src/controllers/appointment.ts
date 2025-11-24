import { Request, Response } from 'express';
import Appointment from '../models/appointment';
import Student from '../models/student';
import Mentor from '../models/mentor';
import { v4 as uuidv4 } from 'uuid';

export const startMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body; // 'student' or 'mentor'

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user role
    if ((role === 'student' && !appointment.student.equals(userId)) || 
        (role === 'mentor' && !appointment.mentor.equals(userId))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Generate Jitsi room ID if not exists
    if (!appointment.roomId) {
      appointment.roomId = `studment-${uuidv4()}`;
      appointment.meetingLink = `https://meet.jit.si/${appointment.roomId}`;
      appointment.meetingStatus = 'started';
      await appointment.save();
    }

    res.json({
      success: true,
      roomId: appointment.roomId,
      meetingLink: appointment.meetingLink
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to start meeting',
      error: error.message 
    });
  }
};

export const endMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user role
    if ((role === 'student' && !appointment.student.equals(userId)) || 
        (role === 'mentor' && !appointment.mentor.equals(userId))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    appointment.meetingStatus = 'ended';
    appointment.status = 'completed';
    appointment.actualEndTime = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: 'Meeting ended successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to end meeting',
      error: error.message 
    });
  }
};