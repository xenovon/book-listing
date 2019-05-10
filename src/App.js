import React from 'react';
import './App.css';

const endPoint = 'https://book-listing-adnanhidayat--xenovon.repl.co'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchResult: {},
      params: {
        keyword: '',
        page: 1,
        type: 'all'
      },
      error: ''
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange = type => event => {
    if (event && event.target) {
      const { value } = event.target
      const { params } = this.state
      
      /* Reset the page if there any change in keyword */
      if (type === 'keyword') {
        params.page = 1
      }

      const newParams = {...params, [type]: value}

      this.setState({params: newParams}, () => {
        if (type === 'page') {
          this.fetchData(this.state.params)
        }
      })
    }
  }
  onSubmit(event) {
    event.preventDefault()
    this.fetchData(this.state.params)
  }
  fetchData({keyword, page, type }) {
    const url = `${endPoint}/?q="${keyword}"&page=${page}&search[field]=${type}`

    fetch(url).then(response => {
      if (response.status !== 200) {
        this.setState({searchResult: {}, error: 'Looks like there was a problem. Status Code: ' + response.status})
        return
      }

      response.json().then(data => {
        this.setState({searchResult: data, error: ''})
      })
    }).catch(err => {
      this.setState({searchResult: {}, error: err})
    })
  }

  renderResult() {
    const { searchResult, error, } = this.state
    const { results, resultStart, resultEnd, queryTimeSeconds, totalResults } = searchResult

    if (error) {
      return (<p><i>{error}</i></p>)
    }

    if (!results || !results.length || totalResults === 0) {
      return (<p><i>No Result</i></p>)
    }

    const books = []
    results.forEach && results.forEach(book => {
      books.push((
        <li key={book.id} className='bookItem'>
          <div className='thumbnail'><img alt={book.title} src={book.smallImageUrl} /></div>
          <div className='content'>
            <h3>{book.title}</h3>
            <p><b>By:</b> {book.author}</p>
            <p><b>Published Year:</b> {book.originalPublicationYear}</p>
            <p><b>Average Rating:</b> {book.averageRating} - {book.ratingsCount} ratings </p>
          </div>
        </li>
      ))
    })

    const pageOptions = () => {
      const result = []
      const pageCount = Math.ceil(totalResults / 20) > 170 ? 170 : Math.ceil(totalResults / 20)

      for (let i = 1; i <= pageCount; i++) {
        result.push((
          <option key={i} value={i}>Page {i}</option>
        ))
      }

      return result
    }

    return (
      <div>
        <div className='searchHeader'>
          <div>
            <select
              value={this.state.params.page}
              onChange={this.onChange('page')}
            >
              {pageOptions()}
            </select>
          </div>
          <div>
            <i>Display {resultStart} to {resultEnd} from </i>
            <i>{totalResults} results in {queryTimeSeconds} seconds</i>
          </div>
        </div>
        <ul >{books}</ul>
      </div>
    )
  }

  render() {
    const { params } = this.state
    const { keyword, type } = params

    return (
      <div className='container'>
        <div className='title'>
          <h1>Goodread Book Search</h1>
          <p>Built By : <a href='http://portfolio.adnanhidayat.com'>Adnan HP</a></p>
        </div>
        <form submit={this.onClick}>
          <div className='formItem'>
            <span>Input Keyword</span>
            <span>
              <input
                type={'text'}
                value={keyword}
                placeholder={'keyword'}
                onChange={this.onChange('keyword')}
              />
            </span>
          </div>
          <div className='formItem'>
            <span>Search Type</span>
            <span>
              <select
                value={type}
                onChange={this.onChange('type')}
              >
                <option value='all'>All</option>
                <option value='author'>Author</option>
                <option value='title'>Title</option>
              </select>
            </span>
          </div>
          <div>
            <button type='submit' onClick={this.onSubmit}>Search</button>
          </div>
        </form>
        <div>
          <h2>Search Result</h2>
          <div>{this.renderResult()}</div>
        </div>
      </div>
    )
  }
}

export default App;
