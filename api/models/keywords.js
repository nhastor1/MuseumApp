module.exports.Keywords = class Keywords{
    constructor(){
        this.STRING = 'text';
        this.TEXTAREA = 'text-area';
        this.INTEGER = 'number';
        this.DATE_TIME = 'datetime-local';
        this.DATE = 'date';
        this.IMAGE = 'image';
        this.VIDEO = 'video';
        this.AUDIO = 'audio';
        this.PDF = 'pdf';
        this.DROPDOWN = 'dropdown';
        this.CHECKBOX = 'checkbox';
        this.RADIOBUTTONS = 'radiobuttons';
        this.CREATE = 'create';
        this.EDIT = 'edit';
        this.LOCATION = 'location';
        this.USERNAME = 'username';
        this.PASSWORD = 'password';
        this.FIRSTNAME = 'firstname';
        this.LASTNAME = 'lastname';
        this.ROLE = 'role';
        this.ROLES = ['Admin', 'Update', 'Read'];
        this.FILES = [this.VIDEO, this.IMAGE, this.AUDIO, this.PDF];
        this.CATEGORY = 'category';
        this.SEARCH = 'search';
        this.NAZIV = 'Naziv';
    }
}