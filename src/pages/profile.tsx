import Navbar from '@/Components/Navbar'
import React, { useState, useEffect } from 'react'
import MarketplaceJSON from '../Marketplace.json';
import axios from 'axios';
import { ethers } from 'ethers';
import { useAccount, useSigner, useContract, useProvider } from 'wagmi'
import { fetchSigner } from '@wagmi/core';
import { useParams } from 'next/navigation';
import NFTTile from '@/Components/NFTTile';
import { GetIpfsUrlFromPinata } from '@/utils';
export default function Profile() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [totalPrice, updateTotalPrice] = useState("0");
    const { address } = useAccount()
    const provider = useProvider();

    useEffect(() => {
        getNFTData();
        console.log('1');
    }, [])
    const getNFTData = async () => {
        let sumPrice = 0;
        const signer = await fetchSigner();

        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

        let transaction = await contract.getMyNFTs() ;
        

        const items = await Promise.all(transaction.map(async (i: any) => {
            let tokenURI = contract ? await contract.tokenURI(i.tokenId) : null;
            console.log("getting this tokenUri", tokenURI);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta: any = await axios.get(tokenURI);
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
            sumPrice += Number(price);
            return item;
        }))

        updateData(items);
        updateFetched(true);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    return (
        <div className="profileClass" style={{ minHeight: "100vh" }}>
            <Navbar></Navbar>
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })}
                    </div>
                    <div className="mt-10 text-xl">
                        {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)" : ""}
                    </div>
                </div>
            </div>
        </div>
    )
};