// A checked attempt is immutable. Only an explicit retry creates editable input.
const transitions={writing:['checking','review','finished'],checking:['writing','review','finished'],review:['retry','finished'],retry:['writing','finished'],finished:['writing']};
export class TaskState {
 constructor(){this.value='finished';this.revision=0;}
 move(next){if(!transitions[this.value].includes(next))return false;this.value=next;this.revision++;return true;}
 get editable(){return this.value==='writing';}
}
export function upsertResult(rows,row){const index=rows.findIndex(x=>x.taskId===row.taskId);if(index<0)rows.push(row);else rows[index]=row;return rows;}
