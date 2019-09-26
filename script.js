/*
    Author: Ethan Lindeman
    Filename: script.js
*/

let getID = (function() {
    var i = 1;

    return function() {
        return i++;
    }
})(); //IIFE for emulating static variable

class Node 
{
    let 
    constructor(name) 
    {
        this.ID = getID();
        this.name = name;
        this.characters = new Map();
        this.endOfWord = false;
    }
    


    addWord(word) 
    {
        word = word.toUpperCase(); //not checking if uppercase before converting because check involves conversion anyway;

        if (word.length == 0 || word === "") {
            this.endOfWord = true;
        }
        else {
            let character = word.slice(0, 1);
            if (word.length == 1)
            {
                word = "";
            }
            else
                word = word.slice(1, word.length);

            if (!this.characters.has(character))
            {
                let n = new Node(character);
                this.characters.set(character, n);
                n.addWord(word);
            }
            else
            {
                this.characters.get(character).addWord(word);
            }
            
        }
    }

    getData()
    {
        let d = [{"child":`${this.name}`, "parent": null, "parentId" : null, "childId" : this.ID }];
        this.getRelations(d);
        return d;
    }

    getRelations(arr)
    {
        for(let [k, n] of this.characters)
        {
            arr.push({
                "child" : `${k}`, "parent" : `${this.name}`, "parentId" : this.ID, "childId" : n.ID
            });
            n.getRelations(arr);
        }
    }

    searchWord(word) 
    {
        word = word.toUpperCase();
        if (word.length == 0 || word === "") 
        {
            return this.endOfWord;
        }
        else
        {
            let character = word.slice(0, 1);
            if (word.length == 1)
            {
                word = "";
            }
            else
                word = word.slice(1, word.length);

            if (!this.characters.has(character))
            {
                return false;
            }
            else
            {
               return this.characters.get(character).searchWord(word);
            }
        }
    }

    render()
    {
        d3.select("svg").remove();
        const width = 500;
        const height = 500;
        let svg = d3.select("#trie").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(50,50)");

        let data = this.getData();
        let count = 0;

        console.log(data);
        let structure = d3.stratify().id((i) => {
            return i.childId;
           
        })
        .parentId((i) => {
            return i.parentId;
        })(data);

        let tree = d3.tree().size([500, 300]);
        let info = tree(structure);

        let circle = svg.append("g").selectAll("circle").data(info.descendants());

        circle.enter().append("circle").attr("cx", (d) => { return d.x; })
        .attr("cy", (d) => { return d.y; }).attr("r", 5);

        let conn = svg.append("g").selectAll("path").data(info.links());

        conn.enter().append("path").attr("d", (d) => {
            return "M" + d.source.x + "," + d.source.y + " C " + d.source.x + "," + (d.source.y + d.target.y)/2 + " " + d.target.x + ","
            + (d.source.y + d.target.y)/2 + " " + d.target.x + "," + d.target.y;
        });

        let textShow = svg.append("g").selectAll("text").data(info.descendants());
        textShow.enter().append("text").text((i) => {
            return i.data.child;
        })
        .attr("x", (i) => {
            return i.x + 6;
        })
        .attr("y", (i) => {
            return i.y + 4;
        });
        
    }
}
let root = new Node("root")

document.getElementById('addBtn').addEventListener('click', function(e) {
    e.preventDefault();

    let input = document.getElementById('addInput').value;
    input = input.split(' ').join('');
    root.addWord(input);
    document.getElementById('addInput').value = "";

    
    root.render();
    
});

document.getElementById('searchBtn').addEventListener('click', function(e) {
    e.preventDefault();

    let input = document.getElementById('searchInput').value;
    input = input.split(' ').join('');
    if(root.searchWord(input))
        alert(`${input} has been found in the trie!`);
    else    
        alert(`${input} could not be found in the trie!`);
    document.getElementById('searchInput').value = "";
});

