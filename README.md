AAA Security Project with Controlled Attacks
A project focused on building a secure REST API with NestJS, with a practical implementation of the three pillars of information security: Authentication, Authorization, and Accountability (AAA).

This API implements a full user CRUD, demonstrating robust security practices at every stage. The main goal is not only to build a functional system but also to validate its defenses through a series of controlled attacks, showcasing how the architecture responds to detect, block, and log malicious activities.

✨ Key Features
Authentication via JWT using the robust RS256 algorithm (public/private key).

Authorization based on access profiles (Roles), such as admin and user.

Accountability (Auditing) with detailed logging of critical system actions (logins, failures, changes, blocks).

Input validation to prevent failures and attacks.

Full user CRUD: register, login, list, edit, and delete.

⚔️ Planned Controlled Attacks
The system is designed to be tested against the following simulated attacks:

Brute Force: Mass login attempts using the Hydra tool.

SQL Injection: Vulnerability testing on input fields with sqlmap.

Token Manipulation: Attempts to alter payloads and break the signature of JWTs with jwt_tool.

🛠️ Tech Stack
Backend: NestJS, TypeORM

Database: PostgreSQL

Authentication: JWT (RS256)

Environment: Docker
