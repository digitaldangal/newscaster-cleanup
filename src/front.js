import React from 'react';
import ReactDOM from 'react-dom';
import {shipNewscaster} from './renderer.js'
import {deleteclips} from './renderer.js'
const util = require('util')
const _ = require('lodash/core');

class FolderCatRow extends React.Component {
	render(){
    let base ="db f5 mb2 mt0 pa1 light-grey bg-dark-gray  bb "
    let classes= this.props.foldobj.paths.length > 0 ?
      (base + "b--green") : (base + "b--red")
    let icon = this.props.foldobj.paths.length > 0 ?
      <span className="green">✔</span> : <span className="red">X</span>
		return (
			<h1
        className={classes}
        key={this.props.foldobj.type}>
				    {icon} {this.props.foldobj.paths.length} {this.props.foldobj.type} Found:
			</h1>
			);
	};
}

class FolderPathRow extends React.Component {
	render(){
		return (
			<p
        className="db f6 code light-gray mv1 pl2"
        key={this.props.path}
      >
				{this.props.path}
			</p>
			);
	};
}

class FolderPaths extends React.Component {
	render(){
		const folder_paths = [];
		this.props.foldobj.paths.forEach(path => {
				folder_paths.push(
          <FolderPathRow
            key={path}
            path={path}
             />)
		});
		return (
			<div>
				{folder_paths}
			</div>
			);
	};
}

class Folders extends React.Component {
	render(){
		const folder_rows = [];
		this.props.folders.forEach(foldobj => {
			folder_rows.push(
				<div>
					<FolderCatRow foldobj={foldobj} />
					<FolderPaths foldobj={foldobj} />
				</div>
			);
		});
		return (
				<div
          className="w-100 br2 cursor-default bg-mid-gray ba b--near-black scroll">
					{folder_rows}
				</div>

			);
	};
};

class StatusRow extends React.Component {
		render(){
      let base = "db f4 mw-100 bl pl2 mv1 cursor-default truncate "
      let classes = this.props.acc == this.props.lenobj.num ?
        (base + "white") : this.props.lenobj.type == "Proxy Folders"
        && this.props.lenobj.num == (this.props.acc*2) ?
          (base + "white") : (base + "dark-red");
		return (

      <h3
        className={classes}
        key={this.props.lenobj.type}>
				{this.props.lenobj.num} Assets in {this.props.lenobj.type}
			</h3>

    );
	};
};

class Statuses extends React.Component {
		render(){
			const status_rows = [];
			this.props.lengths.forEach(lenobj => {
				status_rows.push(
					<StatusRow acc={this.props.accepted_value} lenobj={lenobj} />
				)
			});
		return (
		<div className="mb2 w-100 db truncate pa1 ">
			{status_rows}
		</div>
		);
	};
};

class HalfColTop extends React.Component {
	render(){
		return (
			<div className="w-100 h-25 pb2">
        <Title />
			</div>
		);
	};
};

class HalfColBot extends React.Component {
	render(){
		return (
			<div className="w-100 h-75 bg-dark-gray ba b--black br3 pa3 truncate flex flex-column">
        <Statuses
          lengths={this.props.lengths}
          accepted_value={this.props.lengths[0].num}
          />
				<Folders folders={this.props.folders}/>
			</div>
		);
	};
};

class LeftColumn extends React.Component {
	render(){
		return (
			<div className=" flex-grow h-100 pv2 pl2 pr1">
				<HalfColTop  />
				<HalfColBot

          lengths={this.props.newscaster.lengths}
          folders={this.props.newscaster.folders}
        />
			</div>
		);
	};
};

class ClipPathRow extends React.Component {
  constructor(props) {
      super(props);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleClick = this.handleClick.bind(this);
  }


  handleClick(e){
    if(e.ctrlKey){
      this.props.onSelectAdd(this.props.index)
    }
    else if (e.shiftKey){
      this.props.onSelectExtend(this.props.index);
    }
    else{
      this.props.onSelect(this.props.index);
    }
  }

  handleDelete(path){
    let array = [path]
    if(array.length > 0){
      deleteclips(array)
    }
  }


	render(){
  	return (
      <div
        className={this.props.selectedBool ?
        "db w-100 pl2 relative clip-path-row no-highlight selected" :
        "db w-100 pl2 relative clip-path-row no-highlight"}
        onClick={this.handleClick}
      >
  			<span
          className="f6 w-100 fl di z-1 pt1 code light-gray truncate no-highlight"
          key={this.props.clipkey}

        >
          {this.props.path}
        </span>
        <div className="w-10 z-2 buttonholder l90">
          <div
            className="f6 h-100 w3 mr2 code pa1 smallbutton fr"
            onClick={() => {this.handleDelete(this.props.path)}}
          >
            Delete
          </div>
        </div>
      </div>
		);
	};
};

class ClipPaths extends React.Component {
	render(){
		const path_rows = [];
    this.props.paths.forEach((path, index) => {
      let id = this.props.type+"_"+this.props.place+"_"+this.props.array_id+"_"+index;
      path_rows.push(
				<ClipPathRow
          clipkey={id}
          key={index}
          index={index}
          path={path}
          selectedBool={this.props.selectedClips[index]}
          onSelectExtend={this.props.onSelectExtend}
          onSelectAdd={this.props.onSelectAdd}
          onSelect={this.props.onSelect}
          />
        )
		})
		return (
			<div className="">
				{path_rows}
			</div>
		);
	};
};

class ClipCatRow extends React.Component {
  constructor(props) {
      super(props);
      this.handleSelectAll = this.handleSelectAll.bind(this);
  }

  handleSelectAll(){
    let newclips = new Array(this.props.paths.length)
    for(let i=0; i<newclips.length; i++){
      newclips[i] = true;
    }
    this.props.onSelectAll(newclips)
  }

	render(){
    let foundmissing = this.props.type == "widows" ? "missing from " : "found in "
    let element = this.props.num > 0 ?
        <div className="db w-100 h1h relative">
          <span
            className="f5 w-100 pv1 pl3 fl di z-1 code yellow"
            key={this.props.place}>
    				    {this.props.num} {this.props.type} {foundmissing} {this.props.place}:
    			</span>
          <div className="w-50 l50 z-2 buttonholder">
            <div
              className="f6 h-100 mr2 code pa1 smallbutton fr"
              onClick={this.handleSelectAll}
            >
              Select All
            </div>
          </div>
        </div>
       : <span></span>
		return (
			<div className="clip-cat-row w-100">
        {element}
      </div>
		);
	};
};

class ClipList extends React.Component {
  constructor(props) {
    super(props);
    this.onSelectAdd = this.onSelectAdd.bind(this);
    this.onSelectExtend = this.onSelectExtend.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    let clipArray = [];
    this.state={selectedClips: clipArray};
  }

  componentDidMount() { //fixes bug caused by false values in array
    let blankstate = [];
    for (let i=0; i < this.props.num; i++){
      blankstate[i] = false;
    }
    this.setState({selectedClips: blankstate})
  }


  componentWillReceiveProps(nextprops){
    if(nextprops.delete){
      let deletearray = [];
      for(let i=0; i<this.state.selectedClips.length; i++){
        if (this.state.selectedClips[i]){
          deletearray.push(this.props.obj.paths[i])
        }
      }
      this.props.request(deletearray);
    }
    let blankstate = [];
    for (let i=0; i < this.props.num; i++){
      blankstate[i] = nextprops.every ? true : false;
    }
    this.setState({selectedClips: blankstate})
  }

  onSelectAdd(index){
    let newclips=Array.from(this.state.selectedClips)
    newclips[index] = !newclips[index];
    this.setState({selectedClips: newclips})
  }

  onSelectExtend(index){
    let newclips=Array.from(this.state.selectedClips);
    let last = newclips.lastIndexOf(true, index);
    let next = newclips.indexOf(true, index);
    if (last > 0 && next > 0){
      lasttrue > nexttrue ?
        newclips.fill(true, index, next) :
        newclips.fill(true, last, index);
      this.setState({selectedClips: newclips});
    }
    else{
      if(next >= 0){
        newclips.fill(true, index, next)
        this.setState({selectedClips: newclips});
      }
      if(last >= 0){
        let stop = index+1
        newclips.fill(true, last, stop)
        this.setState({selectedClips: newclips});
      }
    }
  }

  onSelect(index){
    if (this.state.selectedClips[index]){
      let newclips=Array.from(this.state.selectedClips)
      for(let i=0; i<newclips.length; i++){
        newclips[i] = false;
      };
      this.setState({selectedClips: newclips})
      this.props.off();
    }
    else {
      let newclips=Array.from(this.state.selectedClips)
      for(let i=0; i<newclips.length; i++){
        newclips[i] = false;
      }
      newclips[index] = true;
      this.setState({selectedClips: newclips})
    }
  }

  onSelectAll(array){
    this.setState({selectedClips: array})
  }

  render(){
		return (
			<div className="mb1">
				<ClipCatRow
          array_id={this.props.id}
					type={this.props.type}
					num={this.props.num}
					place={this.props.obj.type}
          paths={this.props.obj.paths}
          onSelectAll={this.onSelectAll}
				/>
				<ClipPaths
          array_id={this.props.id}
          type={this.props.type}
          place={this.props.obj.type}
          paths={this.props.obj.paths}
          num={this.props.num}
          selectedClips={this.state.selectedClips}
          onSelect={this.onSelect}
          onSelectExtend={this.onSelectExtend}
          onSelectAdd={this.onSelectAdd}
          />
			</div>
		);
	};
};

class HitStatus extends React.Component {
	render(){
		return (
      <div
        id="hitStatusBar"
        className="mw-90 pl3 pv3 bg-dark-gray bl b--white mb2 truncate"
      >
        <div className="w-90 mw6 h2">
          <span
            className="f3 fl v-mid b helvetica white truncate b">
            {this.props.num} {this.props.type} Clips
          </span>
          <div
            onClick={this.props.deleteSelected}
            className="f6  mr1 h-100 code pa2 smallbutton fr">
            Delete Sel.
          </div>
          <div
            className="f6  mr3 h-100 code pa2 smallbutton fr"
            onClick={this.props.selectEvery}
          >
            Select All
          </div>
        </div>
      </div>
		);
	};
};

class ClipReport extends React.Component {
  constructor(props) {
    super(props);
    this.onTurnOffEveryOrp = this.onTurnOffEveryOrp.bind(this);
    this.onTurnOffEveryWid = this.onTurnOffEveryWid.bind(this);
    this.onTurnOnEveryOrp = this.onTurnOnEveryOrp.bind(this);
    this.onTurnOnEveryWid = this.onTurnOnEveryWid.bind(this);
    this.requestSelectedOrp = this.requestSelectedOrp.bind(this);
    this.requestSelectedWid = this.requestSelectedWid.bind(this);
    this.deleteSelectedOrp = this.deleteSelectedOrp.bind(this);
    this.deleteSelectedWid = this.deleteSelectedWid.bind(this);
    this.state = {
      deleteSelectedOrp: false,
      deleteSelectedWid: false,
      selectEveryOrp: false,
      selectEveryWid: false,
      clipsToDelete: [],
    }
  }

  requestSelectedOrp(){
    console.log("REQUEST SELECTED")
    this.setState({deleteSelectedOrp:true})
  }

  requestSelectedWid(){
    console.log("REQUEST SELECTED")
    this.setState({deleteSelectedWid:true})
  }

  deleteSelectedOrp(array){
    this.setState({deleteSelectedOrp:false})
    if(array.length > 0){
      deleteclips(array)
    }
  }

  deleteSelectedWid(array){
    console.log("DELETE SELECTED")
    this.setState({deleteSelectedWid:false})
    if(array.length > 0){
      deleteclips(array)
    }
  }


  onTurnOffEveryOrp(){
    console.log("TURN OFF EVERY ORP")
    this.setState({selectEveryOrp:false})
  }
  onTurnOffEveryWid(){
    console.log("TURN OFF EVERY WID")
    this.setState({selectEveryWid:false})
  }

  onTurnOnEveryOrp(){
    console.log("TURN ON EVERY ORP")
    this.setState({selectEveryOrp:true})
  }
  onTurnOnEveryWid(){
    console.log("TURN ON EVERY WID")
    this.setState({selectEveryWid:true})
  }

  render(){
    let clipnum = null
		let orphan_count = 0;
		let widow_count = 0;
		const orphan_rows = [];
		const widow_rows = [];

		this.props.orphans.forEach((orpobj, index) => {
			orphan_count += orpobj.paths.length;
      if(orpobj.paths.length > 0){
  			orphan_rows.push(
  				<ClipList
            id={index}
  			obj={orpobj}
  			num={orpobj.paths.length}
  			type="orphans"
            every={this.state.selectEveryOrp}
            off={this.onTurnOffEveryOrp}
            delete={this.state.deleteSelectedOrp}
            request={this.deleteSelectedOrp}
  				/>
  			)
      }
		})
		this.props.widows.forEach((widobj, index) => {
			widow_count += widobj.paths.length;
      if(widobj.paths.length > 0){
        widow_rows.push(
  				<ClipList
            id={index}
  			obj={widobj}
  			num={widobj.paths.length}
  			type="widows"
            every={this.state.selectEveryWid}
            off={this.onTurnOffEveryWid}
            delete={this.state.deleteSelectedWid}
            request={this.deleteSelectedWid}
  				/>
  			)
      }
		})
		return (
      <div className="w-100 h-100 bg-dark-gray ba b--black br3 ph3 pv2">
  			<div className="w-100 h-100 bg-near-black cursor-default scroll ">
  				<HitStatus
            num={orphan_count}
            type="Orphaned"
            selectEvery={this.onTurnOnEveryOrp}
            deleteSelected={this.requestSelectedOrp}
          />
  				{orphan_rows}
  				<HitStatus
          num={widow_count}
          type="Missing"
          selectEvery={this.onTurnOnEveryWid}
          deleteSelected={this.requestSelectedWid}
          />
  				{widow_rows}
  			</div>
      </div>
		);
	};
};

class Title extends React.Component {
			render(){
				var c = "\u00A9"
				return (
					<div className="w-100 h-100 bg-dark-gray ba b--black br3 pa3">
						<img src={"./logo.png"} className="logo" />
						<p className="mv1">NewsCaster Cleanup </p>
						<p className="mv1">{c} NewsMaker Systems 2017</p>
						<p className="mv1">1.2.101017</p>
					</div>
				);
			};
};

class NewsCasterApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      newsCaster: shipNewscaster()
    }
	}
	componentDidMount() {
    setInterval(
      () => this.tick(),
      200
    );
  }
	tick() {
    let newNewsCaster = shipNewscaster();
    let isNewsCasterSame = _.isEqual(newNewsCaster, this.state.newsCaster)
      if(!isNewsCasterSame){
        console.log("NEW NEWSCASTER")
        this.setState({newsCaster: newNewsCaster});
      }
  }
	render(){
		return (
			<div className="w-100 h-100">
				<div className="w-100 h-100 flex items-stretch">
  				<LeftColumn  newscaster={this.state.newsCaster}/>
					<div id="rightColumn" className="flex-grow-2 h-100 pv2 pr2 pl1">
    				<ClipReport
    					orphans={this.state.newsCaster.orphans}
    					widows={this.state.newsCaster.widows}
    				/>
    			</div>
  			</div>
			</div>
		);
	};
};

ReactDOM.render(
  <NewsCasterApp />,
  document.getElementById('main')
);
