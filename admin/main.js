const imgPicker = document.querySelector('#img')
const thumbnail = document.querySelector('#thumbnail')

imgPicker.addEventListener('change', e => {
  const file = e.target.files[0]
  const reader = new window.FileReader()
  reader.addEventListener('load', function () {
    // convert image file to base64 string
    thumbnail.src = reader.result
  }, false)
  if (file) {
    reader.readAsDataURL(file)
  }
})
