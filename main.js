//Get the form where the notes should be displayed
const displaynotes = document.querySelector('.displaynotes');

//To get a reference to the input form - create note
const createnoteform = document.querySelector('.create_note_form');

let checkbox = document.querySelector('.cb_create');
const searchinput = document.querySelector('.search_input');
 

const addNote = ((note, id) => {
    let time = note.created_at.toDate();
    let htmltemplate = `
    <div class="Notes" data-id="${id}">
        <h2>${note.title}</h2> 
        <p>${note.notetxt}</p>
        <p class="small">${time}</p> 
        <p id="importantMSG"></p>
        <button type="button" id="deletebutton" class="btn btn-outline-dark">Delete note</button>
        <button type="button" id="editbutton" class="btn btn-outline-dark">Edit note</button>
    </div>
    `;
    displaynotes.innerHTML += htmltemplate;
});

//Delete note from the browser
const deleteNote = (id) => { 

    const notes = document.querySelectorAll('.Notes');

    notes.forEach(note => {
        if(note.getAttribute('data-id') === id) {
            note.remove();
        }
    })
}

//Real time listener
db.collection('notes').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {

        const doc = change.doc; 

        if(change.type === 'added'){
            addNote(doc.data(), doc.id)
        } 
        
        else if (change.type === 'removed') {
            deleteNote(doc.id);
        }

        let getID = document.querySelector(`div[data-id="${doc.id}"]`);
        let importantOutput = getID.querySelector('#importantMSG');

        if(doc.get('important') === true) {
            importantOutput.innerText = "Important";
        }

        else {
            importantOutput.innerText = "";
        }
    });
});

//Add eventlistener to submit button - create note
createnoteform.addEventListener('submit', e => 
{ //e as a parameter
    e.preventDefault(); 

    const now = new Date(); 

    let importantoutput = '';
    
    if (cb_create.checked) {
        importantoutput = true;
    }
    
    else {
        importantoutput = false;
    }

    const note = {
        title: createnoteform.notetitle.value, 
        created_at: firebase.firestore.Timestamp.fromDate(now), 
        notetxt: createnoteform.notetxt.value,
        important: importantoutput
    }; 

    //get a reference to the collection in firestore, because it's where we want to documents to be saved at. 
    db.collection('notes').add(note).then(() => { //add is used to add a new document to the collection 'recipes' in firestore. pass in the object created represent the recipe - recipe.
        console.log('note added');
    }).catch(err =>{ //used just in case there is an error
        console.log(err);
    });  
});

//Delete note from firebase
displaynotes.addEventListener('click', e => {
    //console.log(e);
    if (e.target.id === 'deletebutton') {

        const id = e.target.parentElement.getAttribute('data-id');

        db.collection('notes').doc(id).delete().then(() => {
            console.log('note deleted');
        })
    }
    if (e.target.id === 'editbutton') {

        const now = new Date(); 
        const id = e.target.parentElement.getAttribute('data-id');
        db.collection("notes").doc(id).update({

            notetxt: createnoteform.notetxt.value,
            created_at: firebase.firestore.Timestamp.fromDate(now), 
            title: createnoteform.notetitle.value,
            //important: importantOutput
            }).then(()=>{
            console.log("updated")
            }).catch(err => {
            console.log(err)
            })
    }
});

//Function for filter
const filterNotes = (term) => {

    Array.from(displaynotes.children)
    .filter((note) => !note.textContent.toLowerCase().includes(term)) // ! turns true to false or the other way round
    .forEach((note) => note.classList.add('filtered'));

    Array.from(displaynotes.children)
    .filter((note) => note.textContent.toLowerCase().includes(term)) // ! turns true to false or the other way round
    .forEach((note) => note.classList.remove('filtered'));
};

//Filter - search - array method filter
//Keyup event on the input field
searchinput.addEventListener('keyup', () => {
    const term = searchinput.value.trim().toLowerCase(); // What a user types in the inputfield - trim trimms off any whitespace
    filterNotes(term);
})

//Edit notes

/* db.collection("notes").doc(id).update({

    body: "some text",
    created_at: Date.now(),
    title: "som text"
    }).then(()=>{
    console.log("updated")
    }).catch(err => {
    console.log(err)
    }) */