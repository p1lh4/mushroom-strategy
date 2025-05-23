# Contributing to this project

First off, thanks for taking the time to contribute!

All types of contributions are encouraged and valued.
See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles
them.

Please make sure to read the relevant section before making your contribution.  
It will make it a lot easier for us maintainers and smooth out the experience for all involved.  
The community looks forward to your contributions.

> And if you like the project but just don't have time to contribute, that's fine.
> There are other easy ways to support the project and show your appreciation, which we would also be thrilled about:
>
> - Star the project.
> - Tweet about it.
> - Refer to this project in the readme of your project.
> - Mention the project at local meetups and tell your friends/colleagues.
> - Sponsor the project at [GitHub Sponsors][sponsorUrl].

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Code Contribution](#code-contribution)
- [Style Guides](#style-guides)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).  
By participating, you are expected to uphold this code. Please report unacceptable behavior to a project leader.

---

## I Have a Question

> [!TIP]
> Before you ask a question, we assume that you have read the [README](README.md) file or the
> available resources at the [Wiki][wikiUrl] or [Discussions][discussionsUrl].

Before you ask a question, it is best to search for existing [discussions][discussionsUrl] or [Issues][issuesUrl]
that might
help you.  
In case you have found a suitable topic and still need clarification, you can address your question in that topic.
It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open a new discussion or issue.
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

---

## I Want To Contribute

> ![Important]
> Legal Notice:  
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the
> necessary rights to the content, and that the content you contribute may be provided under the project license.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information.  
Therefore, we ask you to investigate carefully, collect information, and describe the issue in detail in your report.  
Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side, e.g., using incompatible environment
  components/versions (Make sure that you have read the [Wiki][wikiUrl].
  If you are looking for support, you might want to check [this section](#i-have-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there
  is not already a report existing for your issue in the [issue tracker][issuesUrl].
- Also, make sure to search the internet (including Stack Overflow) to see if users outside the GitHub community have
  discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback).
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM).
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output.
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

#### How Do I Submit a Good Report?

> [!CAUTION]
> You must never report security-related issues, vulnerabilities, or bugs including sensitive information to the issue
> tracker, or elsewhere in public.  
> Instead, sensitive bugs must be sent by email to a project leader.

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [issue][issuesUrl].
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to
  recreate the issue on their own. This usually includes your code.  
  For good bug reports, you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps.
  If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and
  mark the issue as `Needs Feedback`.
  Bugs with the `Needs Feedback` tag will not be addressed until the issuer responds to the team member's comments.
- If the team is able to reproduce the issue, it will be left to be [implemented by someone](#code-contribution).
- If the team decides to not implement the issue, it will be marked as `wont fix` or `invalid`.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Mushroom Strategy, **including completely new
features and minor improvements to existing functionality**.  
Following these guidelines will help maintainers and the community to understand your suggestion and find related
suggestions.

#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Read the [Wiki][wikiUrl] carefully and find out if the functionality is already covered, maybe by an
  individual configuration.
- Search the [issue tracker][issuesUrl] or [Pull Requests][pullRequestUrl] to see if the enhancement has already been
  suggested.  
  If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project.  
  It's up to you to convince the developers of this feature's merits with a well-reasoned proposal.  
  Keep in mind that we want features that will be useful to the majority of our users and not just a small subset.
  If you're just targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues][issuesUrl].

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.  
  At this point, you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part
  which the suggestion is related to.
- **Explain why this enhancement would be useful** to most Mushroom Strategy users.  
  You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Code Contribution

You can contribute to this project by following the _fork → clone → edit → pull request_ workflow of GitHub.

#### Prevent changes to the distribution directory

We must not commit any changes to directory `dist` or its content.
As a help, you can configure your local git repository to ignore this directory.

```shell
git update-index --skip-worktree ./dist/
git update-index --skip-worktree ./dist/name-of-the-file-to-ignore.js
```

To revert above, run the following commands:

```shell
git update-index --no-skip-worktree ./dist/
git update-index --skip-worktree ./dist/name-of-the-file-to-ignore.js
```

##### Additional method

You can add the directory to the `exclude` file of the repository.
However, the directory or its content will not be ignored once it's already tracked.
The syntax is the same as for the `.gitignore` file.

Example of file `<project-directory>/.git/info/exclude`:

```gitexclude
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
/dist/
```

Note: If you already have unstaged changes, you must run the following git command after editing your ignore-patterns:

```shell
git update-index --assume-unchanged ./dist/
```

## Style Guides

### Code Style

All files are required to adhere to the formatting configurations specified within the [.editorconfig](.editorconfig)
file, should it be present.

### Commit Messages

Commit messages must follow [these](https://github.com/DigiLive/gitChangelog/wiki/1-Introduction) guidelines.

## Attribution

This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!

[issuesUrl]: https://github.com/DigiLive/mushroom-strategy/issues

[pullRequestUrl]: https://github.com/DigiLive/mushroom-strategy/pulls

[discussionsUrl]: https://github.com/DigiLive/mushroom-strategy/discussions

[wikiUrl]: https://github.com/DigiLive/mushroom-strategy/wiki

[sponsorUrl]: https://github.com/sponsors/DigiLive
