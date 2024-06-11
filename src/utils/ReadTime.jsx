export const readTime = (desc) => {
    const averageReading = 225;
  
    const div = document.createElement("div");
    div.innerHTML = desc.__html;
  
    const textContext = div.textContent || div.innerHTML;
    const words = textContext.trim().split(/\s+/);
    return Math.ceil(words.length / averageReading);
  };