public with sharing class AppointmentController {
   

    @AuraEnabled(cacheable=true)
    public static List<Appointment_Slots__c> getActiveSlots() {
        return [SELECT Id, Appointment_Date__c, Start_Time__c, End_Time__c FROM Appointment_Slots__c WHERE isActive__c = true];
    }

    @AuraEnabled
    public static String saveAppointment(Appointment_Detail__c appointment) {
        // Check for overlapping appointments
        List<Appointment_Detail__c> existingAppointments = [
            SELECT Id FROM Appointment_Detail__c 
            WHERE Appointment_Date__c = :appointment.Appointment_Date__c 
            AND Appointment_Time__c = :appointment.Appointment_Time__c
            LIMIT 1
        ];

        if (!existingAppointments.isEmpty()) {
            throw new AuraHandledException('This appointment time is already booked.');
        }

        // Verify that appointment time falls within an active slot
        List<Appointment_Slots__c> validSlots = [
            SELECT Id FROM Appointment_Slots__c 
            WHERE Appointment_Date__c = :appointment.Appointment_Date__c 
            AND Start_Time__c <= :appointment.Appointment_Time__c 
            AND End_Time__c >= :appointment.Appointment_Time__c 
            AND isActive__c = true
        ];

        if (validSlots.isEmpty()) {
            throw new AuraHandledException('Selected time is not within any available slot.');
        }

        insert appointment;
        return 'Appointment saved successfully!';
    }
}