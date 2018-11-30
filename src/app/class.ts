export class Room {
  constructor(public id?: number,
    public parent?: number,
    public na?: string,
    public idx?: number,
    public discription?: string,
    public price?: number,
    public folder?: number,
    public chat?: number,
    public contents?: number,
    public plan?: number,
    public prorate?: number,
    public amount?: number,
    public billing_day?: number,
    public trial_days?: number
  ) {
  }
}