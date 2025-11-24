import mongoose, { Document } from 'mongoose';

interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'conference' | 'exam';
  organizer: string;
  link?: string;
  source: 'eventbrite' | 'university' | 'manual';
}

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['hackathon', 'workshop', 'seminar', 'conference', 'exam'],
    required: true 
  },
  organizer: { type: String, required: true },
  link: String,
  source: {
    type: String,
    enum: ['eventbrite', 'university', 'manual'],
    required: true
  }
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);