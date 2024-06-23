import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Editor.scss";



const Editor = ({ value, onChange, placeholder }) => {
  return (
    <ReactQuill
      theme="snow"
      
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default Editor;
