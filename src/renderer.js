const fs = require('fs'); // filesystem
const xml2js = require('xml2js'); // xml parser
const con = require('electron').remote.getGlobal('console'); // Allows output to main process console
const path = require('path'); // Allows path manipulation
const util = require('util')

let newscastershare = null;
let mediashare = null;
let dbobjects = null;
let watchfolders = [];
let hiresfolders = [];
let proxyfolders = [];

let masternames = [];
let wfclips = [];
let dbclips = [];
let hrclips = [];
let prclips = [];

let dborphans = [];
let hrorphans = [];
let prorphans = [];
let dbwidows = [];
let hrwidows = [];
let prwidows = [];

let selectedclips = [];


let newscasterserver = null;
let siteconfig = "C:\\NewsCaster\\Config\\NewsCasterSite.xml"
let newscasterroot = "C:\\NewsCaster\\"
let proxyroot = null;
let database = null;
let mosid = null;

var reactObject = {
  folders:[
    {type: "Watch Folder(s)", paths: watchfolders},
    {type: "Playout Folder(s)", paths: hiresfolders},
    {type: "Proxy folder(s)", paths: proxyfolders},
    {type: "Database(s)", paths: new Array(database)}
  ],

  orphans:[
    {type: "Database", paths: dborphans},
    {type: "Playout", paths: hrorphans},
    {type: "Proxies", paths: prorphans}
  ],

  widows:[
    {type: "Database", paths: dbwidows},
    {type: "Playout", paths: hrwidows},
    {type: "Proxies", paths: prwidows}
  ],

  lengths:[
    {type: "Watch Folders", num: wfclips.length},
    {type: "Database", num: dbclips.length},
    {type: "Playout Folders", num: hrclips.length},
    {type: "Proxy Folders", num: prclips.length}
  ],

}

/*++++++++++++++STARTUP++++++++++++++++*/

document.addEventListener('DOMContentLoaded', function() {
	tick(300);
}, false);


/*++++++++++++++PROGRAM FUNCTIONS++++++++++++++++*/

function tick(delay){
	setInterval( async () => { await dumplists(); scan();}, delay);
}

const scan = async () => {
    try{
		con.log("scanning...")
		await parsesiteconfig()
		await countclips()
		await inspectdb()
		await makeorphanlists();
		await makewidowlists();
		make_react_object();
		con.log("SUCCESS")
    }
    catch(err){
	   console.error(err)
	   con.log(err)
    }
}

export function shipNewscaster(){
	return reactObject;
}

function make_react_object(){
	con.log("Writing reactObject:")
	reactObject = {
		folders:[
			{type: "Watch Folder(s)", paths: watchfolders},
			{type: "Playout Folder(s)", paths: hiresfolders},
			{type: "Proxy folder(s)", paths: proxyfolders},
			{type: "Database(s)", paths: new Array(database)}
		],

		orphans:[
			{type: "Database", paths: dborphans},
			{type: "Playout", paths: hrorphans},
			{type: "Proxies", paths: prorphans}
		],

		widows:[
			{type: "Database", paths: dbwidows},
			{type: "Playout", paths: hrwidows},
			{type: "Proxies", paths: prwidows}
		],

		lengths:[
			{type: "Watch Folders", num: wfclips.length},
			{type: "Database", num: dbclips.length},
			{type: "Playout Folders", num: hrclips.length},
			{type: "Proxy Folders", num: prclips.length}
		],

	}
	//con.log(util.inspect(reactObject, false, null))
};

function dumplists(){
	return new Promise(function (fulfill, reject){
    con.log('Refreshing...');

		newscastershare = null;
		dbobjects = null;
		watchfolders = [];
		hiresfolders = [];
		proxyfolders = [];

		masternames = [];
		wfclips = [];
		dbclips = [];
		hrclips = [];
		prclips = [];

		dborphans = [];
		hrorphans = [];
		prorphans = [];
		dbwidows = [];
		hrwidows = [];
		prwidows = [];

		selectedclips = [];

		fulfill("done");
	})
}

function sayhello(){ //say hello
    setInterval(function(){
        let d = new Date();
        let month = d.getMonth();
        let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let months = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'];
        let hour = d.getHours();
        let seconds =  d.getSeconds();
        let mins = d.getMinutes();
        let meridian = 'AM';

        if (d.getHours() > 12){
            hour -= 12;
            meridian = 'PM'
        }
		else if(d.getHours() == 0){
            hour = 1;
		}

        if ((seconds.toString().length) <= 1){
            seconds = '0' + seconds;
        }

        if ((mins.toString().length) <= 1){
            mins = '0' + mins;
        }

        let hello = document.getElementById('hello');
        hello.innerHTML = '';
        hello.innerHTML = hour + ':' + mins + ':' + seconds + ' '
		+ meridian + ' || ' + days[d.getDay()] + ', ' + months[d.getMonth()]
		+ ' ' + d.getDate() + ', ' + d.getFullYear();
    }, 1000);
};

function parsesiteconfig(){ //get and parse newscastersite file
    return new Promise(function (fulfill, reject){

        fs.access(siteconfig, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        con.log(err ? 'no site!' : 'found siteconfig');
		if (err) return reject(err);
        });

        let parser = new xml2js.Parser({mergeAttrs: true});
        fs.readFile(siteconfig, function(err, data) {
            parser.parseString(data, function (err, result) {
                let newsdefine = result.site.define; 
               
				function findncshare(object) { return object.key == '%newscasterShare';}
                function findmdshare(object) { return object.key == '%mediaShare';}
				function findmosid(object) { return object.key == '%mosid';}
				function findncserver(object) { return object.key == '%newscasterServer';}
				
				//find roots
				mediashare = newsdefine.find(findmdshare).value.toString();
				newscastershare = newsdefine.find(findncshare).value.toString();
				newscasterserver = newsdefine.find(findncserver).value.toString();
				mosid = newsdefine.find(findmosid).value.toString();
				database = "C:\\NewsCaster\\Database\\" +mosid+ ".xml"; //set database location.
				proxyroot = "\\\\"+newscasterserver+"\\Proxies\\"
				
                fs.access(newscastershare, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                    if (err) return reject(err);
                });
				
                let mediascanner = result.site.mediaScanner[0].mediaFolder;
				
                for (let i=0; i < mediascanner.length; i++){ 
                    
					let fullpath = mediascanner[i].destination.toString()
					let index = fullpath.indexOf('\\')
                    let path = fullpath.slice(index);
					//compare logic for root alias
					let isMedia = fullpath.indexOf('mediaShare') >= 0 ? true : false;
					let isNews = fullpath.indexOf('newscasterShare') >= 0 ? true : false;
					let isRoot = fullpath.indexOf('newscasterRoot')	>= 0 ? true : false;
					
					if (mediascanner[i].type == 'FILE'){//push paths of hi res and playouts to arrays
                       
					   watchfolders.push(mediascanner[i]['_'].toString()); //watchfolder push

						if (isNews){
							let playout = newscastershare.concat(path);
							hiresfolders.push(playout);
						}
						else if (isMedia){
							let playout = mediashare.concat(path);
							hiresfolders.push(playout);
						}
						else if (isRoot){
							let playout = newscasterroot.concat(path.substr(1));
							hiresfolders.push(playout);
						}
						else{
							hiresfolders.push(fullpath);
						}
                    }
                    else{ //push proxy path to array
						
						if (isNews){
							let proxy = newscastershare.concat(path);
							proxyfolders.push(proxy);
						}
						else if (isMedia){
							let proxy = mediashare.concat(path);
							proxyfolders.push(proxy);
						}
						else if (isRoot){
							let proxy = newscasterroot.concat(path.substr(1));
							proxyfolders.push(proxy);
						}
						else {
							proxyfolders.push(fullpath);
						}
                    }
                };
				if (err) return reject(err);
                fulfill('siteconfig parsed successfully');
				con.log('siteconfig parsed successfully')
            });

        });

    });
};

const countclips = async () => { //push names of files in parsed folders to arrays
    con.log('counting clips...')


		try{
			await wf_count()
			con.log("done counting wf")
			await hr_count()
			con.log("done counting hr")
			await pr_count()
			con.log("done counting pr")
			con.log('done counting clips')
		}
		catch(err) {
			con.log(err)
			console.error(err)
		}

};

const wf_count = async () => {
	con.log("counting_wf...")
	for (let i=0; i < watchfolders.length; i++){

		await new Promise(function(fulfill, reject){
			let path = watchfolders[i];
			let loop1 = false;
			let loop2 = false;
			fs.readdir(path, function(err, items) {
				for (let j=0; j<items.length; j++) {
					if (items[j] != 'Thumbs.db'){
						let file = path + '\\' + items[j];
						wfclips.push(file);
						
					}
					if (j == (items.length-1)){
						loop1=true;
					}
				}
				for (let k=0; k<items.length; k++){ //create master comparison list
					if (items[k] != 'Thumbs.db'){
						masternames.push(items[k].substring(0, items[k].lastIndexOf('.'))); //trim a version
						masternames.push(items[k]);    //keep reference to full item name
					}
					if (k == (items.length-1)){
						loop2=true;
					}
				}
				if (err) return reject(err);
				if (loop1 && loop2){
				fulfill('done');
				
				}
			});
		});
	};
}

const hr_count = async () => {
	con.log("counting_hr...")
	for (let i=0; i < hiresfolders.length; i++){
		await new Promise(function(fulfill, reject){
			let path = hiresfolders[i];
			let loop = false;
			fs.readdir(path, function(err, items) {
				for (let j=0; j<items.length; j++) {
					if (items[j] != 'Thumbs.db'){
						let file = path + '\\' + items[j];
						hrclips.push(file);
					}
					if (j == (items.length-1)){
						loop=true;
					}
				}
				if (err) return reject(err);
				if (loop) {
					fulfill('done');
				}
			});
		});
	};
};

const pr_count = async () => {
	con.log("counting_pr...")
	for (let i=0; i < proxyfolders.length; i++){
		await new Promise(function(fulfill, reject){

			let path = proxyfolders[i];
			let loop = false;
			fs.readdir(path, function(err, items) {
				for (let j=0; j<items.length; j++) {
					if (items[j] != 'Thumbs.db'){
						let file = path + '\\' + items[j];
						prclips.push(file);
					}
					if (j == (items.length-1)){
						loop=true;
					}
				}
				if (err) return reject(err);
				if (loop) {
					fulfill('done');
				}
			});
		})
	};
};

const inspectdb = async () => { //read db file, find all clips in there, and made 'dbclips' array
		const db_file = await readdb()
		con.log("done reading db");
		await parsedb(db_file);
		con.log("done parsing db");
}

const readdb = async () => {
	con.log("reading db...")
	const readdb = await new Promise(function(fulfill, reject){
		 fs.readFile(database, "utf8", function(err, data) {
			fulfill(data);
			if (err) return reject(err);
		});
	});
	return readdb;
}

const parsedb = async (data) => {
	con.log("parsing db...")
	//con.log(data)
	const clips = [];
	let parser = new xml2js.Parser();
	parser.parseString(data, function (err, result) {
		dbobjects = result.cliplist.clip;

		for (let i=0; i < dbobjects.length; i++){
			dbclips.push(dbobjects[i].hiresvideo.toString());
		};
		if (err) console.error(err);
		if (err) return reject(err);
	});
};

function makeorphanlists(){ //compare other lists to watch folder lists

    function findorphans(cliplist, name){
        for (let i=0; i < cliplist.length; i++){

            let clip = path.parse(cliplist[i]).base; //grab base name of path from array
            let trimclip = clip;

             if (clip.indexOf('.') < 0 || name=='hrclips' || name=='dbclips'){ 
                trimclip = clip;
            }
            else{
                trimclip = clip.substring(0, clip.lastIndexOf('.'));//trim clip if it has an extra extension
            }

            if(masternames.indexOf(trimclip) < 0){
                //con.log('*****ORPHAN FOUND*****');
                //con.log('Perp: ' + trimclip);

                if(name == 'hrclips'){ // push paths of orphans to arrays for deleting
                    hrorphans.push(cliplist[i]);
                }
                else if(name == 'dbclips'){
                    dborphans.push(cliplist[i]);
                }
                else if(name == 'prclips'){
                    prorphans.push(cliplist[i]);
                };
            };
        };
    };
    findorphans(hrclips, 'hrclips');
    findorphans(prclips, 'prclips');
    findorphans(dbclips, 'dbclips');
}

function makewidowlists(){ //compare watch folder list to other lists

    function findwidows(comparelist, name){

        let compare = []; //create array for current comparison
		let local
        for (let i=0; i < comparelist.length; i++){ //grab name of currently compared clip out of currently compared list


            let clip = path.parse(comparelist[i]).base; //grab base name of path from array
            let trimclip = null;

			if(clip != 'Thumbs.db'){
				
				compare.push(clip);
				
				/* if (clip.indexOf('.') < 0){ //trim clip if it has an extra extension
					con.log("CLIP: " + clip)
					
					trimclip = clip;

				}
				else{
					
					trimclip = clip.substring(0, clip.lastIndexOf('.'));
					compare.push(trimclip);
				}; */
			};
        };

		function isincomparison(wfclip){
			//con.log("Length: " + wfclips.length)
			//con.log("searching for... " + comparisonclip)
			
			for (let j=0; j < compare.length; j++){
				
				let local = path.parse(wfclip).base;
				if(compare[j].indexOf(local) >= 0){
					//con.log(local+" ~~~~~~ "+compare[j]);
					return true;
				}
				if(j==(compare.length-1)){
					return false
				}
			}
		}
		
		for (let i=0; i < wfclips.length; i++){
			
			if (!isincomparison(wfclips[i])){
				con.log('*****WIDOW FOUND*****');
                con.log('Perp: ' + wfclips[i]);

                if(name == 'hrclips'){ // push paths of widows to arrays
                    hrwidows.push(wfclips[i]);
                }
                else if(name == 'dbclips'){
                    dbwidows.push(wfclips[i]);
                }
                else if(name == 'prclips'){
                    prwidows.push(wfclips[i]);
                };
			}

				
		}
		
        /* for (let i=0; i < compare.length; i++){
			
            
			if (i <= wfclips.length){
				let clip = path.parse(wfclips[i]).base; //grab base name of path from array
			}
            let trimclip = null;

           

		    if (clip.indexOf('.') < 0){ //trim clip if it has an extra extension
                trimclip = clip;
            }
            else{
                trimclip = clip.substring(0, clip.lastIndexOf('.'));
            };
			con.log(i);
			//con.log(trimclip +" found at " + compare[compare.indexOf(trimclip)]);
			
           




		   if(compare.indexOf(trimclip) < 0){ //if clip does not exist in currently compared list
                
            };
        };
		 */
		
		
		
    };

    findwidows(hrclips, 'hrclips');
    findwidows(prclips, 'prclips');
    findwidows(dbclips, 'dbclips');

};

function selectclip(item){
	item.classList.add("selected");
	item.addEventListener("click", function deselect(){
		deselectclip(item);
		item.removeEventListener("click", deselect, false)
		}, false);
	selectedclips.push(item.id);
	con.log(selectedclips);
}

function deselectclip(item){
	item.classList.remove("selected");
	let index = selectedclips.indexOf(item.id);
	selectedclips.splice(index, 1);

	item.addEventListener("click", function select() {
		selectclip(item);
		item.removeEventListener("click", select, false);
	}, false);
}

function deleteselected(){

	let resultHandler = function(err) {
		if(err) {
		   con.log("unlink failed", err);
		} else {
		   con.log("file deleted");
		}
	}

	for (let i=0; i < selectedclips.length; i++){
		let index = selectedclips.indexOf(selectedclips[i]);
		selectedclips.splice(index, 1);
		con.log(selectedclips);
		fs.unlink(selectedclips[i], resultHandler);
	}
}

export function deleteclips(list){
	let resultHandler = function(err) {
		if(err) {
		   con.log("unlink failed", err);
		} else {
		   con.log("file deleted");
		}
	}
	for (let i=0; i < list.length; i++){
		fs.unlink(list[i], resultHandler);
	}
}
