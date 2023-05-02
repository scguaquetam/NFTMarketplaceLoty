import Navbar from '@/Components/Navbar';
import React, { useEffect, useState } from 'react';
import NFTTile from '@/Components/NFTTile';
import MarketplaceJSON from '../Marketplace.json';
import { GetIpfsUrlFromPinata } from '@/utils';
import axios from 'axios';
import { ethers } from 'ethers';
import { useContract, useProvider, useContractRead } from 'wagmi'

export default function Home() {
  
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const provider = useProvider();
  const contract = useContract({
    address: MarketplaceJSON.address,
    abi: MarketplaceJSON.abi,
    signerOrProvider: provider,
  });
  useEffect(() => {
    getAllNFTs();
  }, [])
  
  const getAllNFTs = async () => {
    let transaction = contract ? await contract.getAllNFTs() : null ;
    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async (i : any) => {
      let tokenURI = contract ? await contract.tokenURI(i.tokenId) : null;
      console.log("getting this tokenUri", tokenURI);
      tokenURI = GetIpfsUrlFromPinata(tokenURI);
      let meta : any = await axios.get(tokenURI);
      meta = meta.data;

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      }
      return item;
    }))

    updateFetched(true);
    updateData(items);
    console.log(items);
    
  }

  // if(!dataFetched)
  //   getAllNFTs();
  return (
    <React.Fragment>
      <Navbar />
      <div className="flex flex-col place-items-center mt-20">
        <div className="md:text-xl font-bold text-white">
          Top NFTs
        </div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {data.map((value, index) => {
            return <NFTTile data={value} key={index}></NFTTile>;
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
