import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MusicApp.css'

const idb = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const createCollectionsInIndexedDB = () =>{
    if(!idb){
        console.log('This browser does not support Indexed DB');
        return;
    }
    console.log(idb)

    const request = idb.open("music-upload-data", 2);

    request.onerror = (event) => {
        console.log('Error', event);
        console.log('An error occured with IndexedDB')
    };
    request.onupgradeneeded = (event) => {
        const db = request.result;

        if(!db.objectStoreNames.contains('MusicUploadData')){
            db.createObjectStore('MusicUploadData', {
                keyPath:'id' 
            });
        }
        if(!db.objectStoreNames.contains('Temp')){
            db.createObjectStore('Temp', {
                keyPath:'id' 
            });
        }
        if(!db.objectStoreNames.contains('PlayList')){
            db.createObjectStore('PlayList', {
                keyPath:'id' 
            });
        }
    };

    request.onsuccess = () => {
        console.log('Database Created successfully');
    };
};

const MusicApp = () => {

    const [fileName, setFileName] = useState();
    const [allMusicData , setAllMusicData] = useState([]);
    const [alltempData, setAllTempdata] = useState([]);
    const [addFile, setAddFile] = useState(false);
    const [editFile, setEditFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState({});
    const [updateFilename, setUpdateFilename] = useState({});
    const [updateInput, setUpdateInput] = useState();
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        createCollectionsInIndexedDB();
        getAlldata();
    }, [fileName]);


    const getAlldata = () => {
        const dbPromise = idb.open("music-upload-data", 2) 

        dbPromise.onsuccess = () => {
            const db = dbPromise.result;

            const tx = db.transaction("MusicUploadData", "readonly");

            const MusicUploadData = tx.objectStore("MusicUploadData");

            const music = MusicUploadData.getAll();

            music.onsuccess = (query) => {
                setAllMusicData(query.srcElement.result);
            }

            music.onerror = (query) => {
                console.log('Error in fetching data');
            }

            tx.oncomplete = () => {
                db.close();
            }
        }
        //setTimeout(window.location.reload() , 1500)
    }

    const getAllTempdata = () => {
        const dbPromise = idb.open("music-upload-data", 2) 

        dbPromise.onsuccess = () => {
            const db = dbPromise.result;

            const tx = db.transaction("Temp", "readonly");

            const Temp = tx.objectStore("Temp");

            const temp = Temp.getAll();

            temp.onsuccess = (query) => {
                setAllTempdata(query.srcElement.result);
                //console(query)
            }

            temp.onerror = (query) => {
                console.log('Error in fetching data');
            }

            tx.oncomplete = () => {
                db.close();
            }
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if(file){
            const audioBlob = await convertFileToBlob(file);
            const dbPromise = idb.open("music-upload-data", 2) 
            dbPromise.onsuccess = () => {
                const db = dbPromise.result;
                const tx = db.transaction("Temp", "readwrite");
                const Temp = tx.objectStore("Temp");

                let temp = Temp.put({
                    id: 1,
                    audioBlob,
                    file,
                });
                temp.onsuccess = () => {
                    tx.oncomplete = () => {
                        db.close();
                    }
                    getAllTempdata();
                        //alert('Music Added temp data')
                };
                temp.onerror = (event) => {
                    console.log(event);
                    alert('Error occured');
                };

                const t = db.transaction("MusicUploadData", "readonly");
                const Data = t.objectStore("MusicUploadData");
                const getData = Data.getAll();
                getData.onsuccess = (event) => {
                    const allData = event.target.result;
                    allData.forEach(record => {
                        if( record.audioblob.length === audioBlob.length && 
                            record.filename === file.name && 
                            record.filesize === file.size && 
                            record.filetype === file.type){
                            alert('Data Present in DB')
                            clearTempData();
                            if(fileInputRef.current)
                                fileInputRef.current.value = '';
                            return;
                            //alert('Data cleared')
                        }
                    });
                }
            }
        }
    }

    function clearTempData(){
        const dbPromise = idb.open("music-upload-data", 2) 
            dbPromise.onsuccess = () => {
                const db = dbPromise.result;
                const tranx = db.transaction("Temp", "readwrite");
                const Temp = tranx.objectStore("Temp");
                const cleanTemp = Temp.clear();
                    
                cleanTemp.onsuccess = () => {
                    tranx.oncomplete = () => {
                        db.close();
                    }
                }
                cleanTemp.onerror = (error) => {
                    console.log(error);
                    alert('Error occured');
                }
            }
    }

    function refresh(flag){
        if(flag)
        {
            if(window.confirm("Changes may not be saved"))
            window.location.reload();
        }
        else{
            if(window.confirm("Changes may not be saved"))
                window.location.reload();
                clearTempData();
        }  
    }


    const handleSubmit = (event) => {
        const dbPromise = idb.open("music-upload-data", 2) 
        if (addFile) {
            let audioblob = alltempData[0].audioBlob;
            let file = alltempData[0].file

            dbPromise.onsuccess = () => {
                const db = dbPromise.result;

                const tx = db.transaction("MusicUploadData", "readwrite");

                const MusicUploadData = tx.objectStore("MusicUploadData");

                const filename = file.name
                const filesize = file.size
                const filetype = file.type
        

                    var cursoreq = MusicUploadData.openCursor(null, "prev");
                    cursoreq.onsuccess = (event) => {
                        var cursor = event.target.result;
                        if(cursor){
                            let music = MusicUploadData.put({
                                id: cursor.value.id + 1,
                                audioblob,
                                filename,
                                filesize,
                                filetype,
                            });
                            music.onsuccess = () => {
                                tx.oncomplete = () => {
                                    db.close();
                                }
                                getAlldata();
                                alert('Music Added')
                            };
                            music.onerror = (event) => {
                                console.log(event);
                                alert('Error occured');
                            };
                        }else{
                            let music = MusicUploadData.put({
                                id: allMusicData?.length + 1,
                                audioblob,
                                filename,
                                filesize,
                                filetype,
                            });
                            music.onsuccess = () => {
                                tx.oncomplete = () => {
                                    db.close();
                                }
                                getAlldata();
                                alert('Music Added')
                            };
                            music.onerror = (event) => {
                                console.log(event);
                                alert('Error occured');
                            };
                        } 
                    }

                    cursoreq.onerror = () => {
                        let music = MusicUploadData.put({
                            id: allMusicData?.length + 1,
                            audioblob,
                            filename,
                            filesize,
                            filetype,
                        });
                        music.onsuccess = () => {
                            tx.oncomplete = () => {
                                db.close();
                            }   
                            getAlldata();
                            alert('Music Added')
                        };
                        music.onerror = (event) => {
                            console.log(event);
                            alert('Error occured');
                        };
                    }
                    clearTempData();
            }
            //setTimeout(refesh, 1500);
            if(fileInputRef.current)
                fileInputRef.current.value = '';
        }
        else{
            dbPromise.onsuccess = () => {
                const db = dbPromise.result;

                const tx = db.transaction("MusicUploadData", "readwrite");

                const MusicUploadData = tx.objectStore("MusicUploadData");

                const getRequest = MusicUploadData.get(selectedFile?.id);

                getRequest.onsuccess = (event) => {
                    const record = event.target.result;
                    const ab = record.audioblob
                    if(updateFilename === ''){
                        alert('Empty Update not possible')
                        return;
                    }
                    const fn = updateFilename
                    const fs = record.filesize
                    const ft = record.filetype
                    if (record) {
                        let music = MusicUploadData.put({
                            id: selectedFile?.id,
                            audioblob: ab,
                            filename: fn,
                            filesize: fs,
                            filetype: ft,
                        });

                        music.onsuccess = () => {
                            tx.oncomplete = () => {
                                db.close();
                            }
                            alert('Music Data Updated')
                            getAlldata();
                        };
                        music.onerror = (event) => {
                            console.log(event);
                            alert('Error occured');
                        };
                    }else{
                        console.log('Record with ID', selectedFile?.id, 'not found');
                    }
                } 
                getRequest.onerror = (error) => {
                    console.error('Error getting record from IndexedDB:', error);
                };
            }
        }
    }

    const convertFileToBlob = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsArrayBuffer(file);
        });
      };


      /* const convertBlobToFile = (arrayBuffer) => {
        const fileFromBuffer = new File([arrayBuffer], selectedFile.name, { type: selectedFile.type });
        console.log(fileFromBuffer)
        return fileFromBuffer;
      }; */

      const deleteFileHandler = (file) => {
        const dbPromise = idb.open("music-upload-data", 2) 

        dbPromise.onsuccess = () => {
            const db = dbPromise.result;
            const tx = db.transaction("MusicUploadData", "readwrite");
            const MusicUploadData = tx.objectStore("MusicUploadData");
            const deleteFile = MusicUploadData.delete(file?.id);
            deleteFile.onsuccess = () => {
                alert('Music Deleted!')
                getAlldata();
            }
            deleteFile.onerror = (query) => {
                console.log('Error in deleting data data');
            }
            /*tx.oncomplete = () => {
                db.close();
            }*/
            const trans = db.transaction("PlayList", "readwrite");
            const PlayListData = trans.objectStore("PlayList");
            const DataforPlayList = PlayListData.get(file?.id);
           
            DataforPlayList.onsuccess = function(event){
                const data = event.target.result;
                if(typeof data !== 'undefined'){
                    const ta = db.transaction("PlayList", "readwrite");
                    const data = ta.objectStore("PlayList");
                    const deletePlayData = data.delete(file?.id);
                    deletePlayData.onsuccess = () => {
                        alert('Music Deleted From PlayList!')
                        //getAlldata();
                    }
                    deletePlayData.onerror = (query) => {
                        console.log('Error in deleting data data');
                    }
                    ta.oncomplete = () => {
                        db.close();
                    }
                }
                else{
                    alert('Data not found in PlayList');
                }
            }
            trans.oncomplete = () => {
                db.close();
            }
        }
      }

      const handlePlayListUpload = (row) => {
        const dbPromise = idb.open("music-upload-data", 2) 
        dbPromise.onsuccess = () => {
            const db = dbPromise.result;
            const tx = db.transaction("PlayList", "readwrite");
            const checkPlayList = tx.objectStore("PlayList");
            const DataforPlayList = checkPlayList.get(row.id);
            DataforPlayList.onsuccess = function(event){
                const data = event.target.result;
                if(typeof data !== 'undefined'){
                    alert('Music already present in PlayList')
                    //window.location.reload();
                }
                else{
                    const trans = db.transaction("PlayList", "readwrite");
                    const PlayData = tx.objectStore("PlayList");
                    const play = PlayData.put({
                        id: row?.id,
                        audioblob: row?.audioblob,
                        filename: row?.filename,
                        filesize: row?.filesize,
                        filetype: row?.filetype,
                    });
                    play.onsuccess = () => {
                        trans.oncomplete = () => {
                            db.close();
                        }
                        alert('Data Uploaded to PlayList')
                        //getAlldata();
                        //window.location.reload();
                    };
                    play.onerror = (event) => {
                        console.log(event);
                        alert('Error occured');
                    };
                }
            }
            DataforPlayList.onerror = (error) => {
                console.error('Error getting record from IndexedDB:', error);
            };
        }
      }

      const PlayListPage = () => {
            navigate('../test');
      }

    return (
        <div className='row' style={{ padding: 100 }}>
            <em><strong>Music Upload Page</strong></em>
            <div className='col-md-6'>
                <button className='btn btn-primary float-end mb-2' onClick={() => {
                    setAddFile(true)
                    setEditFile(false)
                    setSelectedFile("")
                    setUpdateFilename("")
                    setUpdateInput("")
                }}>Add New Music</button>
                <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th>Song name</th>
                            <th>Song size</th>
                            <th>Song type</th>
                            <th>Add song to Playlist</th>
                            <th>Update</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        { allMusicData?.map((row) => (
                            <tr key={row?.id}>
                                <td>{row?.filename}</td>
                                <td>{Math.round(row?.filesize / Math.pow(10 ,6))}MB</td>
                                <td>{row?.filetype}</td>
                                <td><button className='btn btn-primary float-end mb-2'
                                onClick={() => {
                                    handlePlayListUpload(row)
                                }}>Add to PlayList</button></td>
                                <td>
                                    <button className='btn btn-success' 
                                    onClick={() => {
                                        setAddFile(false)
                                        setEditFile(true)
                                        setSelectedFile(row)
                                        setUpdateFilename(row?.filename)
                                        setUpdateInput(row)
                                    }}>Edit</button>{" "}</td>
                                  <td><button className='btn btn-danger' onClick={() => {
                                        deleteFileHandler(row)
                                    }}>Delete</button>
                                </td> 
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>
            <div className='col-md-6'>
                { addFile || editFile ?
                    (<div className='card' style={{ padding: '20px', marginLeft: '50px' }}>
                    <h3>{ editFile ? "Update" : "Add Music" }</h3>
                    { editFile ?
                        (<div className='form-group'>
                        <label>Update music file</label>
                        {updateInput && (
                            <div>
                                <p>FileName: {updateInput.filename}</p>
                                <p>FileType: {updateInput.filetype}</p>
                                <p>FileSize: {(updateInput.filesize / Math.pow(10 ,6))}MB</p>
                            </div>
                        )}
                        <p>Filename</p>
                        <input 
                            type='text' 
                            name='fileData' 
                            className='form-control'
                            onChange={(e) => setUpdateFilename(e.target.value)}
                            value={updateFilename}
                        />
                    </div>
                    ) : 
                    (<div className='form-group'>
                        <label>Add music file</label>
                        <input 
                            type='file' 
                            name='musicData' 
                            className='form-control'
                            ref={fileInputRef}
                            onChange={e => handleFileUpload(e)}
                        />
                    </div>)
                    }
                    <div className='form-group'>
                        <button className='btn btn-primary mt-2' onClick={handleSubmit}>
                            { editFile ? "Update" : "Add Music" }
                        </button>{" "}
                        <button className='btn btn-primary mt-2' onClick={
                            () => refresh(editFile)
                            }>{editFile ? "Cancel Update" : "Cancel"}</button>
                    </div>
                </div>
                ) : null}
            </div>
            <div className='col-md-6'>
                <button className='btn btn-primary float-end mb-2'  onClick={() => PlayListPage()}>PlayList</button>
            </div>
        </div>
    )
}


export default MusicApp
