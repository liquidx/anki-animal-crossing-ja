const data = {
  messages: [],
  categories: {}
}

const state = {
  selectedCategoryPath: '',
  maxRows: 1000,
  categoryExclude: ['Tutorials'],
}

const CATEGORIES = [
  'Dialog',
  'LayoutMsg',
  'Mail',
  'String',
  'System',
  'TalkFtr',
  'TalkNNpc',
  'TalkSNpc',
  'TalkObj',
  'TalkSys',
  'Tutorials',
]


const el = (tag, attributes, contents) => {
  const element = document.createElement(tag)
  if (attributes.className) {
    element.classList.add(attributes.className)
  }
  for (let attrKey of Object.keys(attributes)) {
    if (attrKey == 'className') { continue }
    element.setAttribute(attrKey, attributes[attrKey])
  }
  if (typeof contents == 'string') {
    let textNode = document.createTextNode(contents)
    element.appendChild(textNode)
  } else if (typeof contents == 'object' && contents.length) {
    for (let child of contents) {
      element.appendChild(child)
    }
  }
  return element
}

const td = (attributes, contents) => el('td', attributes, contents)
const tr = (attributes, contents) => el('tr', attributes, contents)

const renderMessageRow = (message) => {
  const row = tr({className: 'message'}, [
    td({className: 'en'}, message.en),
    td({className: 'ja'}, message.ja),
    td({className: 'id'}, message.msgId)
  ])
  return row
}

const renderTable = () => {
  const table = document.querySelector('table#messages')
  const tbody = table.querySelector('tbody')
  tbody.innerHTML = ''

  let count = 0
  for (let message of data.messages) {
    if (state.selectedCategoryPath.length > 0 && !message.msgId.startsWith(state.selectedCategoryPath)) {
      continue
    }
    tbody.appendChild(renderMessageRow(message))
    count++;
    if (count > state.maxRows) {
      break
    }
  }
}

const createCategorySelector = (categories, parent) => {
  const categorySelector = el('select', {})
  categorySelector.dataset.parentPath = parent
  categorySelector.appendChild(el('option', {value: '*'}, '*'))
  for (let category of Object.keys(categories)) {
    categorySelector.appendChild(el('option', {value: category}, category))
  }
  categorySelector.addEventListener('change', e => {
    const parentCategoryPath = e.target.dataset.parentPath
    let categoryPath = e.target.value
    if (parentCategoryPath) {
      categoryPath = `${parentCategoryPath}.${categoryPath}`
    }

    state.selectedCategoryPath = categoryPath

    console.log(categoryPath)

    // Remove any selectors that don't match the path.
    let categorySelectors = e.target.parentElement
    let removableSelectors = []
    for (let child of categorySelectors.children) {
      console.log(child.dataset.parentPath, child)
      if (child.dataset.parentPath && !categoryPath.startsWith(child.dataset.parentPath)) {
        removableSelectors.push(child)
      }
    }

    for (let child of removableSelectors) {
      child.parentElement.removeChild(child)
    }

    // Add the next level selector
    const nextLevelCategorySelector = createCategorySelector(categories[e.target.value], categoryPath)
    categorySelectors.appendChild(nextLevelCategorySelector)
    renderTable()
  })
  return categorySelector
}

const renderCategories = () => {
  const categorySelectors = document.querySelector('#categorySelectors')
  const categorySelector = createCategorySelector(data.categories, '')
  categorySelectors.appendChild(categorySelector)
}

const extractCategories = (messages) => {
  let categories = {}
  for (let message of messages) {
    let identifier = message.msgId.split('.')
    if (!categories[identifier[0]]) {
      categories[identifier[0]] = {}
    }
    let cat = categories[identifier[0]]
    for (let level = 1; level < identifier.length; level++) {
      if (!cat[identifier[level]]) {
        cat[identifier[level]] = {}
      }
      cat = cat[identifier[level]]
    }
  }
  return categories
}

const processMessages = (messages) => {
  let processed = []

  for (let message of messages) {
    let processedMessage = Object.assign({}, message)
    let identifier = message.msgId.split('.')
    processedMessage.category1 = identifier[0]
    processedMessage.category2 = identifier[1]
    processed.push(processedMessage)
  }
  return processed
}

const main = () => {
  fetch('/data/messages.json')
    .then(response => response.json())
    .then(jsonResponse => {
      data.categories = extractCategories(jsonResponse)
      data.messages = processMessages(jsonResponse)
      renderCategories()
      renderTable()
    })
}

window.addEventListener('DOMContentLoaded', () => {
  main()
})
