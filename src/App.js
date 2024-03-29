import './App.css';
import { useState } from 'react';
import { CeramicClient } from '@ceramicnetwork/http-client';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'

const endpoint = "https://ceramic-clay.3boxlabs.com"
function App() {
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [loaded, setLoaded] = useState(false)
  
async function connect(){
  const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' })
return addresses
} 

async function readProfile(){
  const [address] = await connect()
  const ceramic = new CeramicClient(endpoint)
  const idx = new IDX({ceramic})


  try {
    const data = await idx.get(
      'basicProfile',
      `${address}@eip155:1`
    )
    console.log('data: ', data)
    if (data.name) setName(data.name)
    if (data.avatar) setImage(data.avatar)
  } catch (error) {
    console.log('error: ', error)
    setLoaded(true)
  }
    
  }
  async function UpdateProfile(){
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const threeIdConnect = new ThreeIdConnect()
    const provider = new EthereumAuthProvider(window.ethereum, address)
    await threeIdConnect.connect(provider)

    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic)
      }
    })
    ceramic.setDID(did)
    await ceramic.did.authenticate()

    const idx = new IDX({ceramic})
    await idx.set('basicProfile', {
      name,
      avatar: image
  })
  console.log("Profile Updated")


  }


  return (
    <div className="App"> 
    <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
    <input type="text" placeholder='Profile Image' value={image} onChange={(e) => setImage(e.target.value)} />
    <button onClick={UpdateProfile}>Update Profile</button>
      <button onClick={readProfile}>Read Profile</button>
      
      {name && <h3>{name}</h3>}
      {image && <img style={{ width: '400px'}}src={image} />}
      {(!image && !name && loaded) && <h3>Profile not found, please create one..</h3>}
    </div>
  );
}

export default App;
