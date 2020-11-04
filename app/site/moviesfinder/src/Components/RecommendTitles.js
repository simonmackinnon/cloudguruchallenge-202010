import React, { Component } from "react";
import { bindAll } from "lodash";

class RecommendTitles extends Component {

  constructor() {
    super();
    this.state = {
      searchInput: "",
      foundTitles: [],
      selectedTitleId: "", 
      recommendedTitles: []
    };

    bindAll(
      this, 
      "searchTitles",
      "handleSearchChange",
      "handleTitleSelect",
      "recommendTitles"
    );
  }

  searchTitles(e) {

    let searchString = this.state.searchInput;

    fetch('https://vn1aniwdlj.execute-api.ap-southeast-2.amazonaws.com/live?search='+searchString, {
      "headers": {},
      "referrer": "",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    })
    .then(results => {return results.json();})
    .then(data => {
      this.setState({ 
        foundTitles: JSON.parse(data.titles).slice(0, 20), 
        selectedTitleId: "",
        recommendedTitles: []
      });
      return {
        foundTitles: this.state.foundTitles,
        selectedTitleId: this.state.selectedTitleId,
        recommendedTitles: this.state.recommendedTitles
      };
    });
  }

  handleSearchChange(e) {
    this.setState({
      searchInput: e.target.value
    });
  }

  handleTitleSelect(e) {
    this.setState({
      selectedTitleId: e.target.id
    });
    console.log("selected: ", e.target.id)
  }

  recommendTitles(e) {

    let reftitleid = this.state.selectedTitleId;

    fetch('https://vn1aniwdlj.execute-api.ap-southeast-2.amazonaws.com/live?recommendfortitle='+reftitleid, {
      "headers": {},
      "referrer": "",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    })
      .then(results => {
        return results.json();
      })
      .then(data => {
        this.setState({ recommendedTitles: JSON.parse(data.titles)});
        return {
          recommendedTitles: this.state.recommendedTitles
        };
      });
  }

  render() {
    
    let titleSelectHandler = this.handleTitleSelect
    let foundTitles = this.state.foundTitles
    let selectedTitleId = this.state.selectedTitleId
    let recommendedTitles = this.state.recommendedTitles

     let titlesElems = this.state.foundTitles.map(
       function(element, i){
         var titleId = element.titleid
         var title = element.title
        return (
          <div key={i}>
            <input 
              className={titleId === selectedTitleId ? "App-Button-Active" : "App-Button-Default"}
              id={titleId} 
              type="button" 
              value={title} 
              title={title}
              onClick={titleSelectHandler}
            />
            <br />
          </div>
        )
      }
    )

     let recommendationsElems = this.state.recommendedTitles.map(
       function(element, i){
         var titleId = element.titleid

         console.log("titleid: ", {titleId}.titleId)
         var title = element.title
         var url = "https://www.imdb.com/title/"+{titleId}.titleId
        return (
          <div key={i}>
            <a href={url}>{title}</a>
          </div>
        )
      }
    )
    
    return (
      <div id="recommend-titles">
          <br />
          <br />
          <img 
            className="banner"
            src="Banner.png" />
          <br />
          <br />
          <label>Search for a movie:  </label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Type Title Here"
            onChange={this.handleSearchChange}
          />
          <input
            id="SearchButton"
            type="button"
            value="Search"
            onClick={this.searchTitles}
          />
          <br />
          <br />
          <label className={typeof foundTitles !== 'undefined' && foundTitles.length > 0 ? "nothidden" : "hidden"}>
            Select movie to recommend on!
          </label>
          <br />
          <br />
          <div className="container">
            {titlesElems}
          </div>
          <br />
          <br />
          <div className={selectedTitleId === "" ? "hidden" : "nothidden"}>
            <input
              id="RecommendButton"
              type="button"
              value="Find Movies For Me!"
              onClick={this.recommendTitles}
            />
            <br />
            <br />
          </div>
          <div className={typeof recommendedTitles !== 'undefined' && recommendedTitles.length > 0 ? "nothidden" : "hidden"}>
            <label>Recommended Movies</label>
            <br />
            <br />
            <div className="container">
              {recommendationsElems}
            </div>
            <br />
            <br />
          </div>
          <br />
          <br />
      </div>
    );
  }
}

export default RecommendTitles;