import { LightningElement , track, wire} from 'lwc';
import getActiveSlots from '@salesforce/apex/AppointmentController.getActiveSlots';
import saveAppointment from '@salesforce/apex/AppointmentController.saveAppointment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppointmentForm extends LightningElement {
    
    @track appointment = {
        Appointment_Date__c: '',
        Appointment_Time__c: '',
        Contact__c: '',
        Subject__c: '',
        Description__c: ''
    };

    @track activeSlots = [];
    @track isLoading = false;
    @track showRecordPicker = true;

    @wire(getActiveSlots)
    wiredSlots({ error, data }) {
        if (data) {
            this.activeSlots = data;
        } else if (error) {
            this.showToast('Error', 'Failed to fetch appointment slots.', 'error');
        }
    }

    handleInputChange(event) {
        const field = event.target.name;
        if(field == 'Contact__c'){
            this.appointment[field] = event.detail.recordId;
        }else {
            this.appointment[field] = event.target.value;
        }
    
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-record-picker')]
            .reduce((validSoFar, inputCmp) => validSoFar && inputCmp.checkValidity(), true);
        if (!allValid) {
            this.showToast('Error', 'Please fill in all required fields.', 'error');
        }
        return allValid;
    }

    handleSubmit() {
        if (!this.validateForm()) return;

        this.isLoading = true;

        saveAppointment({ appointment: this.appointment })
            .then(result => {
                this.showToast('Success', result, 'success');
                this.resetForm();
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    resetForm() {
        this.template.querySelectorAll('lightning-input, lightning-textarea,lightning-record-picker').forEach(input => {
            input.value = '';
        });
        this.appointment = {
            Appointment_Date__c: '',
            Appointment_Time__c: '',
            Contact__c: '',
            Subject__c: '',
            Description__c: ''
        };
         // Temporarily hide and then show the record picker to reset it
        this.showRecordPicker = false;
            setTimeout(() => {
            this.showRecordPicker = true;
            }, 0);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}