import { deriveEvents } from './events';
import raw from './instagram.json';

test('an undated manual event stays visible in Archive without a calendar date',()=>{
  const data=deriveEvents({overrides:{},manualEvents:[{id:'no-date',title:'Date to be announced',type:'WORKSHOP'}]});
  expect(data.events.some(event=>event.id==='no-date')).toBe(true);
  expect(data.archiveMonths.find(month=>month.month==='Undated events').events[0].title).toBe('Date to be announced');
  expect(Object.values(data.eventsByDate).flat().some(event=>event.id==='no-date')).toBe(false);
});

test('hidden entries stay hidden and multiple events share a calendar day',()=>{
  const data=deriveEvents({overrides:{},manualEvents:[{id:'one',title:'First',date:'2025-01-01'},{id:'two',title:'Second',date:'2025-01-01'},{id:'hidden',title:'Hidden',hidden:true}]});
  expect(data.eventsByDate['2025-01-01'].map(event=>event.id)).toEqual(['one','two']);
  expect(data.posts.some(event=>event.id==='hidden')).toBe(false);
});

test('Instagram overrides survive derivation and keep the source data unchanged',()=>{
  const original=raw.posts.find(post=>post.isEvent);
  const data=deriveEvents({overrides:{[original.id]:{title:'Corrected event'}},manualEvents:[]});
  expect(data.posts.find(post=>post.id===original.id).title).toBe('Corrected event');
  expect(original.title).not.toBe('Corrected event');
});
