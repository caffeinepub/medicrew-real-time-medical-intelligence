import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetVerifiedDoctors } from '../../hooks/useQueries';
import { Calendar as CalendarIcon, Clock, User, Stethoscope, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentBookingProps {
  onClose: () => void;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function AppointmentBooking({ onClose }: AppointmentBookingProps) {
  const { data: doctors, isLoading: loadingDoctors } = useGetVerifiedDoctors();
  const [step, setStep] = useState<'doctor' | 'datetime' | 'details' | 'confirm'>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const selectedDoctorProfile = doctors?.find(d => d.user.toString() === selectedDoctor);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Appointment booked successfully!', {
      description: `Your appointment with Dr. ${selectedDoctorProfile?.name} is confirmed.`,
    });
    
    setIsBooking(false);
    onClose();
  };

  const renderDoctorSelection = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Select a verified doctor for your appointment
      </div>
      
      {loadingDoctors ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {doctors.map((doctor) => (
            <Card
              key={doctor.user.toString()}
              className={`cursor-pointer transition-all duration-400 hover-lift ${
                selectedDoctor === doctor.user.toString()
                  ? 'border-primary border-2 bg-primary/5'
                  : 'card-soft'
              }`}
              onClick={() => setSelectedDoctor(doctor.user.toString())}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">Dr. {doctor.name}</h4>
                      {doctor.verified && (
                        <Badge variant="outline" className="text-xs bg-alert-normal/10 text-alert-normal border-alert-normal/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Stethoscope className="w-4 h-4" />
                      <span>{doctor.specialty}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verified doctors available at the moment</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-full hover-lift">
          Cancel
        </Button>
        <Button
          onClick={() => setStep('datetime')}
          disabled={!selectedDoctor}
          className="flex-1 rounded-full hover-lift"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base mb-3 block">Select Date</Label>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md border"
          />
        </div>
      </div>

      {selectedDate && (
        <div>
          <Label className="text-base mb-3 block">Select Time</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? 'default' : 'outline'}
                className="w-full rounded-full hover-lift"
                onClick={() => setSelectedTime(time)}
              >
                <Clock className="w-4 h-4 mr-2" />
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep('doctor')} className="flex-1 rounded-full hover-lift">
          Back
        </Button>
        <Button
          onClick={() => setStep('details')}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 rounded-full hover-lift"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description" className="text-base mb-3 block">
          Reason for Visit <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Please describe your symptoms or reason for consultation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          This information helps the doctor prepare for your appointment
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1 rounded-full hover-lift">
          Back
        </Button>
        <Button
          onClick={() => setStep('confirm')}
          disabled={!description.trim()}
          className="flex-1 rounded-full hover-lift"
        >
          Review Appointment
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Doctor</p>
            <p className="font-semibold">Dr. {selectedDoctorProfile?.name}</p>
            <p className="text-sm text-muted-foreground">{selectedDoctorProfile?.specialty}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarIcon className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-semibold">
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-muted-foreground">{selectedTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Stethoscope className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Reason for Visit</p>
            <p className="font-medium">{description}</p>
          </div>
        </div>
      </div>

      <div className="bg-alert-warning/10 border border-alert-warning/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          <strong>Note:</strong> This is a demonstration appointment booking system. 
          In production, you would receive a confirmation email and SMS reminder.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep('details')} className="flex-1 rounded-full hover-lift" disabled={isBooking}>
          Back
        </Button>
        <Button
          onClick={handleBookAppointment}
          disabled={isBooking}
          className="flex-1 rounded-full hover-lift"
        >
          {isBooking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'doctor':
        return 'Select Doctor';
      case 'datetime':
        return 'Choose Date & Time';
      case 'details':
        return 'Appointment Details';
      case 'confirm':
        return 'Confirm Appointment';
      default:
        return 'Book Appointment';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'doctor':
        return 'Choose from our verified medical professionals';
      case 'datetime':
        return 'Pick a convenient date and time for your consultation';
      case 'details':
        return 'Tell us about your health concerns';
      case 'confirm':
        return 'Review your appointment details before confirming';
      default:
        return '';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['doctor', 'datetime', 'details', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-2 rounded-full flex-1 transition-all duration-400 ${
                  ['doctor', 'datetime', 'details', 'confirm'].indexOf(step) >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>

        {step === 'doctor' && renderDoctorSelection()}
        {step === 'datetime' && renderDateTimeSelection()}
        {step === 'details' && renderDetailsForm()}
        {step === 'confirm' && renderConfirmation()}
      </DialogContent>
    </Dialog>
  );
}
