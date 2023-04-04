// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DiagnosticToken is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    mapping(uint256 => bool) private _pdfHashSet;
    bytes32 public constant DIAGNOSTICIAN_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    // Define mapping to store PDF hash for each token ID
    mapping(uint256 => string) private _pdfHashes;

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs";
    }

    constructor() ERC721("Diagnostic", "DGC") {
        _setupRole(DIAGNOSTICIAN_ROLE, msg.sender);
    }

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function mintDiagnostic(
        address _to,
        uint256 _tokenId,
        string memory _tokenURI
    ) external {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
    }

    function setPDFHash(uint256 tokenId, string memory pdfHash) public {
        require(
            !_pdfHashSet[tokenId],
            "PDF hash has already been set for this token ID"
        );
        _pdfHashes[tokenId] = pdfHash;
        _pdfHashSet[tokenId] = true;
    }

    function getPDFHash(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _pdfHashes[tokenId];
    }

    // The following functions are overrides required by Solidity.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
