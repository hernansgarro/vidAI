import assert from 'node:assert/strict';
import {test} from 'node:test';
import {lineIntersection} from '../simulation';

test('A rejection control: changing the clipped endpoint changes exact intersection coordinates',()=>{
  let changed=0;
  for(let i=0;i<128;i++) {
    const a=.03+i*.011,x=117.5,y=126,dx=Math.cos(a),dy=Math.sin(a);
    const edge:[number,number,number,number]=[260,100+i*.7,270,180+i*.3];
    const full=lineIntersection(x,y,x+dx*500,y+dy*500,...edge);
    const clipped=lineIntersection(x,y,x+dx*200,y+dy*200,...edge);
    if(full.hit&&clipped.hit&&(full.x!==clipped.x||full.y!==clipped.y))changed++;
  }
  assert.ok(changed>0,'source-order clipped arithmetic must not be replaced by a full-range minimum');
});
