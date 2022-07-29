// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using Strings for uint256;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string) public metadataRegistry;

    string public dataStr;

    // Base URI
    string private _baseURIextended;

    constructor() ERC721("ARGRAM", "ARGRAMM") {

    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
    internal
    virtual
    {
        require(
        _exists(tokenId),
        "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory)
    {
        require(
        _exists(tokenId),
        "ERC721Metadata: URI query for nonexistent token"
        );
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
        return _tokenURI;
     }
    // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
        return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
        }
    
    function mintNFT(address recipient, string memory _tokenURI)
        public onlyOwner
        returns (uint256)
        {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        setData(_tokenURI,newItemId);
        return newItemId;
        }
   

    function transferNFT(string memory _metadata, address _newOwner, uint256 tokenId) external {
        uint256 metadataLength = bytes(_metadata).length;
        require(metadataLength > 0, "Empty metadata");

        setData(_metadata, tokenId);
        // transferOwnership(_newOwner);
        _setTokenURI(tokenId,_metadata);
        _transfer(msg.sender, _newOwner, tokenId);
    }

    
    function setData(string memory _metadata, uint _tokenId) internal onlyOwner {
        metadataRegistry[_tokenId] = _metadata;
        dataStr = _metadata;
    } 

    function getData(uint _tokenId) public view returns(string memory){
        // require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        return metadataRegistry[_tokenId];
    }

    function getCurrentId() external view returns(uint){
        return _tokenIds.current();
    }
}   