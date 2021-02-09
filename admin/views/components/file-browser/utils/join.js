export default (...parts) => parts.filter(part => part.length > 0).join('/')
