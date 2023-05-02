import { useState } from "react";
import Navbar from "@/Components/Navbar"
import {uploadFileToIPFS, uploadJSONToIPFS} from '../pinata';
import { fetchSigner } from '@wagmi/core';
import { ethers } from "ethers";
import Marketplace from '../Marketplace.json'
import { useProvider, useSigner } from 'wagmi'
const sellNFT = () => {
  const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState('');
  const provider = useProvider();
  const { data: signer, isError, isLoading } = useSigner()
  const onChangeFile = async (e : any) => {
    let file = e.target.files[0];
    
    try {
      const response = await uploadFileToIPFS(file);
      if(response.success === true){
        console.log("Uploaded image to Pinata", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("error trying to upload", e);
    }
  }
  const uploadMetadataToIPFS = async () => {
    const {name, description, price} = formParams;
    if( !name || !description || !price || !fileURL){
        updateMessage("Please fill all the fields!")
        return -1;
    };
    const nftJSON = {
      name, description, price, image : fileURL
    }
    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if(response.success === true){
        console.log("Uploaded to pinata", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log('error uploading JSON to pinata', e);
    }
  }
  const onDone = async (e : any) => {
    e.preventDefault();
    try {
      const metadataURL = await uploadMetadataToIPFS();
      const signer = await fetchSigner();
      updateMessage("Please wait... uploading info (5 mins approx)");
      console.log(formParams.price);
      
      const price = ethers.utils.parseUnits(formParams.price, 'ether');
      console.log(price);
      
      if(!price) return;
      console.log(signer);
      
      const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);

      const listingPrice = await contract.getListPrice();

      let transaction = await contract.createToken(metadataURL, price, {value: listingPrice}) ;

      await transaction.wait();

      alert("Success Listing NFT");
      updateMessage('');
      updateFormParams({name:'', description: '', price:''});
      window.location.replace('/');
      window.location.reload();
    } catch (e) {
      console.log("error trying to complete", e);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-gray-600 shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-white mb-8">Upload your NFT to the marketplace</h3>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Input name ..." onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
            <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline" cols={40} rows={5} id="description" type="text" placeholder="NFT description..." value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
          </div>
          <div>
            <label className="block text-white text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
            <input type={"file"} onChange={(e) =>  onChangeFile(e)}></input>
          </div>
          <br></br>
          <div className="text-red-500 text-center">{message}</div>
          <button onClick={onDone} className="font-bold mt-10 w-full bg-sky-950 text-white rounded p-2 shadow-lg" id="list-button">
            List NFT
          </button>
        </form>
      </div>
    </div>
  )
}

export default sellNFT