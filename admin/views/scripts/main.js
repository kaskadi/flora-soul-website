const imgPicker = document.querySelector('#img-picker')
const thumbnail = document.querySelector('#thumbnail')
const uploadButton = document.querySelector('#upload-button')

imgPicker.addEventListener('change', e => {
  const file = e.target.files[0]
  const key = file.name
  if (!file) {
    thumbnail.src = ''
  } else {
    const reader = new window.FileReader()
    reader.addEventListener('load', function () {
      // convert image file to base64 string
      const content = reader.result
      storeData({ key, content })
    }, false)
    reader.readAsDataURL(file)
  }
})

uploadButton.addEventListener('click', e => {
  const init = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(getData())
  }
  window.fetch('http://localhost:3101', init)
})

function storeData ({ key, content }) {
  thumbnail.src = content
  thumbnail['data-key'] = key
}

function getData () {
  return {
    key: thumbnail['data-key'],
    content: thumbnail.getAttribute('src')
  }
}
