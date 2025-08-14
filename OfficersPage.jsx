
const officers = [
    {
      name: "First Last",
      title: "President",
      photo: "/white-square-md.png"
    },
    {
      name: "First Last",
      title: "Vice President",
      photo: "/white-square-md.png"
    },
    {
        name: "First Last",
        title: "Treasurer",
        photo: "/white-square-md.png"
    },
      {
        name: "First Last",
        title: "Secretary",
        photo: "/white-square-md.png"
    },
      {
        name: "First Last",
        title: "",
        photo: "/white-square-md.png"
    },
      {
        name: "First Last",
        title: "",
        photo: "/white-square-md.png"
    },
      {
          name: "First Last",
          title: "",
          photo: "/white-square-md.png"
        },
        {
          name: "First Last",
          title: "",
          photo: "/white-square-md.png"
        }
  ];
  
//   export default officers;

function OfficerCard({ name, title, photo }) {
    return (
      <div className="officer-card">
        <img src={photo} className="officer-photo" />
        <h2>{name}</h2>
        <h3 className="officer-title">{title}</h3>
      </div>
    );
  }
  

function OfficersPage() {
    return (
      <div className="officers-page">
        <div className="officers-header">
            <h2>Meet The Ganji E-Board</h2>
            <h4>2025-2026</h4>
        </div>
        <div className="officers-grid">
          {officers.map((officer, index) => (
            <OfficerCard
              key={index}
              name={officer.name}
              title={officer.title}
              photo={officer.photo}
            />
          ))}
        </div>
      </div>
    );
  }
  
  export default OfficersPage;