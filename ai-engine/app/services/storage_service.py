import os
import hashlib
import json
from pathlib import Path
from typing import Optional
from app.core.logger import logger


class StorageService:
    """
    Decentralized storage service for IPFS/Arweave integration.

    In production, integrate with:
    - IPFS: web3.storage, Pinata, or local IPFS node
    - Arweave: Bundlr Network or direct Arweave upload

    For this implementation, we simulate decentralized storage
    and return mock CIDs/transaction IDs.
    """

    def __init__(self):
        self.storage_dir = Path("/tmp/generated_data")
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def upload_to_ipfs(self, file_path: str) -> str:
        """
        Upload file to IPFS and return CID.

        Production implementation:
        import ipfshttpclient
        client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
        res = client.add(file_path)
        return res['Hash']
        """
        try:
            file_hash = self._calculate_file_hash(file_path)

            # Simulate IPFS CID (Content Identifier)
            cid = f"Qm{file_hash[:44]}"

            logger.info(f"File uploaded to IPFS: {cid}")

            # In production, use actual IPFS gateway
            ipfs_link = f"https://ipfs.io/ipfs/{cid}"

            return ipfs_link
        except Exception as e:
            logger.error(f"IPFS upload failed: {str(e)}")
            raise

    def upload_to_arweave(self, file_path: str) -> str:
        """
        Upload file to Arweave and return transaction ID.

        Production implementation:
        from arweave import Wallet, Transaction, ArweaveClient
        wallet = Wallet('wallet.json')
        client = ArweaveClient()
        with open(file_path, 'rb') as f:
            data = f.read()
        tx = Transaction(wallet, data=data)
        tx.sign()
        tx.send()
        return tx.id
        """
        try:
            file_hash = self._calculate_file_hash(file_path)

            # Simulate Arweave transaction ID
            tx_id = file_hash[:43]

            logger.info(f"File uploaded to Arweave: {tx_id}")

            # In production, use actual Arweave gateway
            arweave_link = f"https://arweave.net/{tx_id}"

            return arweave_link
        except Exception as e:
            logger.error(f"Arweave upload failed: {str(e)}")
            raise

    def upload_file(self, file_path: str, storage_type: str = "ipfs") -> str:
        """
        Upload file to decentralized storage.

        Args:
            file_path: Path to file to upload
            storage_type: 'ipfs' or 'arweave'

        Returns:
            Storage link (IPFS or Arweave URL)
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if storage_type.lower() == "ipfs":
            return self.upload_to_ipfs(file_path)
        elif storage_type.lower() == "arweave":
            return self.upload_to_arweave(file_path)
        else:
            raise ValueError(f"Unsupported storage type: {storage_type}")

    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def get_file_metadata(self, file_path: str) -> dict:
        """Get file metadata."""
        stat = os.stat(file_path)
        return {
            "size_bytes": stat.st_size,
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "hash": self._calculate_file_hash(file_path)
        }


storage_service = StorageService()
