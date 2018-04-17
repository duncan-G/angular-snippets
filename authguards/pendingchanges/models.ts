export class DataModel
{
    data_id     : number;
    field_one   : string;
    field_two   : string;
    field_three : string;
    
    constructor(data?)
    {
      data = data || {};
      this.data_id = data.data_id || 0;   // Optional: Generate a new id if data_id === null
      this.field_one = data.field_one || '';
      this.field_two = data.field_two || '';
      this.field_three = data.field_three || '';
    }
}
