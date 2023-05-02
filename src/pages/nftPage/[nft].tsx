import Navbar from '@/Components/Navbar'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi'
import { ethers } from "ethers";
import { fetchSigner } from '@wagmi/core';
import MarketplaceJSON from '../../Marketplace.json';
import { GetIpfsUrlFromPinata } from '@/utils';
import axios from 'axios';

const nft = () => {
  const router = useRouter();
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const { address, isConnecting, isDisconnected } = useAccount();

  useEffect(() => {
    getNFTData(router.query.nft);
  }, [])

  async function getNFTData(tokenId: any) {

    const signer = await fetchSigner();

    const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    var tokenURI = await contract.tokenURI(tokenId);


    const listedToken = await contract.getListedForTokenId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta: any = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    }
    console.log(item);
    if(typeof item.image == "string")
      item.image = GetIpfsUrlFromPinata(item.image);
    updateData(item);
    updateDataFetched(true);
    console.log("address", address)
    
  }
  async function buyNFT(tokenId: any) {
    try {
      const signer = await fetchSigner();
      const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

      const salePrice = ethers.utils.parseUnits(data.price, 'ether');
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
      let transaction = await contract.executeSale(tokenId, { value: salePrice });
      await transaction.wait();

      alert('You successfully bought the NFT!');
      updateMessage("");
    }
    catch (e) {
      alert("Upload Error" + e)
    }
  }
  return(
    <div style={{minHeight:"100vh"}}>
        <Navbar></Navbar>
        <div className="flex ml-20 mt-20">
            <img src={data.image} alt="" className="w-2/5" />
            <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                <div>
                    Name: {data.name}
                </div>
                <div>
                    Description: {data.description}
                </div>
                <div>
                    Price: <span className="">{data.price + " ETH"}</span>
                </div>
                <div>
                    Owner: <span className="text-sm">{data.owner}</span>
                </div>
                <div>
                    Seller: <span className="text-sm">{data.seller}</span>
                </div>
                <div>
                { address != data.owner && address != data.seller ?
                    <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(router.query.nft)}>Buy this NFT</button>
                    : <div className="text-emerald-700">You are the owner of this NFT</div>
                }
                
                <div className="text-green text-center mt-3">{message}</div>
                </div>
            </div>
        </div>
    </div>
)
}

export default nft