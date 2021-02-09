const links = document.querySelectorAll('a')

function proxyQs (e) {
  e.preventDefault()
  window.location = e.target.href + window.location.search
}

for (const link of links) {
  link.addEventListener('click', proxyQs)
}
