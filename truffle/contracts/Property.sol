// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract Property is ERC721, ERC721URIStorage, IERC721Receiver  {
    using Counters for Counters.Counter;
    mapping(uint256 => string) private _pdfHashes;
    mapping(uint256 => bool) private _pdfHashSet;
    mapping(uint256 => uint256) private creationTime;
    mapping(uint256 => uint256) private expiryDate;
    Counters.Counter private _tokenIdCounter;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function setDocumentHash(
        uint256 _tokenId,
        string memory _documentHash
    ) public {
        require(
            !_pdfHashSet[_tokenId],
            "Document hash has already been set for this token ID"
        );
        _pdfHashes[_tokenId] = _documentHash;
        _pdfHashSet[_tokenId] = true;
    }

    function getDocumentHash(
        uint256 tokenId
    ) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _pdfHashes[tokenId];
    }

    function safeMint(
        address to,
        string memory uri,
        uint256 _expiryDate
    ) public returns (uint256) {
        uint256 currentTime = block.timestamp;
        require(
            _expiryDate > currentTime,
            "Expiry date should be in the future"
        );
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        creationTime[tokenId] = currentTime;
        expiryDate[tokenId] = _expiryDate;
        return tokenId;
    }

    function isValid(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return block.timestamp < expiryDate[tokenId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
