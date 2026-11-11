import React, { useState } from 'react';
import PhotoPicker from './PhotoPicker';
import { imageUrl } from '../content';
const fields = {
  officers:[['name','Name'],['position','Position'],['image','Portrait','image']],
  performances:[['title','Title'],['date','Date','date'],['artist','Artist'],['description','Description','textarea'],['venue','Venue'],['time','Time'],['dancers','Dancers'],['videoLink','Video URL','url'],['image','Performance photo','image']],
  about:[['description','Club description','textarea'],['image','Group photo','image'],['workshopImage','Workshop introduction photo','image'],['officerYear','Officer year'],['instagram','Instagram URL','url'],['discord','Discord invite URL','url'],['email','Contact email','email']],
};
export default function AdminContent({section,content,onChange,uploadPhoto,pending,busy}) {
  const [editing,setEditing]=useState(null);const [error,setError]=useState('');
  const updateSection=value=>onChange({...content,[section]:value});
  const list=section==='about'?[]:content[section];
  const save=e=>{
    e.preventDefault();setError('');
    if(section==='performances' && !/^\d{4}-\d{2}-\d{2}$/.test(editing.date||'')){setError('Choose a performance date.');return;}
    updateSection(section==='about'?editing:list.some(item=>item.id===editing.id)?list.map(item=>item.id===editing.id?editing:item):[...list,editing]);setEditing(null);
  };
  if(section==='photos')return <section className="admin-card admin-content-section"><h2>Photo library</h2><p>Upload photos here, then select them in events, officers, About, or performances.</p>
    <PhotoPicker value="" onChange={()=>{}} photos={content.photos} uploadPhoto={uploadPhoto} pending={pending}/>
    <div className="admin-photo-grid">{content.photos.map(photo=><article key={photo.id}><img src={pending.find(file=>file.image===photo.image)?.preview || imageUrl(photo.image)} alt={photo.title}/><label className="admin-field"><span>Photo name</span><input value={photo.title || ''} onChange={e=>updateSection(list.map(item=>item.id===photo.id?{...item,title:e.target.value}:item))}/></label><button className="admin-button-ghost" disabled={busy} onClick={()=>{if(window.confirm('Remove this photo from the library? Existing page references will keep working.'))updateSection(list.filter(item=>item.id!==photo.id));}}>Remove from library</button></article>)}</div>
  </section>;
  return <section className="admin-card admin-content-section"><div className="admin-section-heading"><h2>{{officers:'Officers',performances:'Performances',about:'About & contact'}[section]}</h2>{!editing && <button className="admin-button" disabled={busy} onClick={()=>setEditing(section==='about'?{...content.about}:{id:crypto.randomUUID(),title:'',name:'',position:'',date:'',image:''})}>{section==='about'?'Edit About':section==='officers'?'+ New officer':'+ New performance'}</button>}</div>
    {editing ? <form onSubmit={save}><div className="admin-form-grid">{fields[section].map(([key,label,type='text'])=> type==='image'?<fieldset className="admin-field-wide admin-image-field" key={key}><legend>{label}</legend><PhotoPicker value={editing[key]} onChange={value=>setEditing(item=>({...item,[key]:value}))} photos={content.photos} uploadPhoto={uploadPhoto} pending={pending}/></fieldset>:<label className={type==='textarea'?'admin-field admin-field-wide':'admin-field'} key={key}><span>{label}</span>{type==='textarea'?<textarea rows="6" required={key==='description'} value={editing[key] || ''} onChange={e=>setEditing({...editing,[key]:e.target.value})}/>:<input type={type} required={['title','name','position','date'].includes(key)} value={editing[key] || ''} onChange={e=>setEditing({...editing,[key]:e.target.value})}/>}</label>)}</div>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button type="button" className="admin-button-ghost" onClick={()=>setEditing(null)}>Cancel</button><button className="admin-button" disabled={busy}>Done</button></div></form> : section==='about'?<><p>{content.about.description}</p><p>Officer year: {content.about.officerYear}</p></>:<div className="admin-content-records">{!list.length && <p>No entries yet.</p>}{list.map(item=><article className="admin-content-record" key={item.id}><img src={pending.find(file=>file.image===item.image)?.preview || imageUrl(item.image)} alt=""/><div><strong>{item.name || item.title}</strong><p>{item.position || item.date}</p></div><button className="admin-button-ghost" onClick={()=>setEditing({...item})}>Edit</button><button className="admin-button-ghost admin-button-danger" onClick={()=>{if(window.confirm('Delete this entry?'))updateSection(list.filter(record=>record.id!==item.id));}}>Delete</button></article>)}</div>}
  </section>;
}
