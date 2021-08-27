import React, { useState, useEffect } from "react";
import { Typography, Card, Radio, Form, Button, Input, notification, Divider } from "antd";
import { Blockie, AddressInput } from "../components";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
const { Title, Paragraph } = Typography;

function OurApp({ address, localContracts, mainnetProvider }) {
  const [addressInfoForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  let defaultUpdateFunction = "transfer";
  const [updateFormFunction, setUpdateFormFunction] = useState(defaultUpdateFunction);

  const [decimals, setDecimals] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [myBalance, setMyBalance] = useState();
  const [addressBalance, setAddressBalance] = useState();
  const [addressAllowance, setAddressAllowance] = useState();
  const [myAllowanceOnAddress, setMyAllowanceOnAddress] = useState();
  const songsTest = ["song1", "song2", "song3", "song4", "song5", "song6"];

  const [songList, setSongList] = useState(songsTest);
  const [currentArtist, setCurrentArtist] = useState();
  const [currentArtistAddress, setCurrentArtistAddress] = useState();
  const [hasAccess, setHasAccess] = useState();
  const [didMount, setDidMount] = useState(true);
  const APIURL = "http://localhost:8080/api";
  const valueAmount = 0.000001;

  const gridStyle = {
    width: "33%",
    textAlign: "center",
  };
  const artistDict = { "Flying Lotus": "0xd9837d0b546345f2Bd5749C7Ff4Ce5035e0B7828" };

  let contractOptions = localContracts ? Object.keys(localContracts) : [];
  const [selectedContract, setSelectedContract] = useState();

  useEffect(() => {
    return () => setDidMount(false);
    if (!selectedContract) {
      setSelectedContract(contractOptions[0]);
    }
  }, [contractOptions, selectedContract]);

  const makeCall = async (callName, contract, args) => {
    if (contract[callName]) {
      let result;
      if (args) {
        result = await contract[callName](...args);
      } else {
        result = await contract[callName]();
      }
      if (result.hash) {
        notification.open({
          message: "Success",
          description: `👀  ${callName} successful`,
        });
      }
      return result;
    }
  };
  function artistButton(artist) {
    setCurrentArtist(artist);
    setCurrentArtistAddress(artistDict[artist]);
  }

  const getErc20Info = async () => {
    if (selectedContract) {
      let _totalSupply = await makeCall("totalSupply", localContracts[selectedContract]);
      let _decimals = await makeCall("decimals", localContracts[selectedContract]);
      let _balanceOf = await makeCall("balanceOf", localContracts[selectedContract], [address]);

      setTotalSupply(formatUnits(_totalSupply, _decimals));
      setMyBalance(formatUnits(_balanceOf, _decimals));
      setDecimals(_decimals);
    }
  };

  usePoller(getErc20Info, 3000);

  let contractTitle;

  if (selectedContract) {
    contractTitle = (
      <p>
        <span style={{ verticalAlign: "middle" }}>
          <Blockie address={localContracts[selectedContract]["address"]} />
        </span>
        <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 28 }}>{selectedContract}</span>
      </p>
    );
  }

  const getAddressInfo = async values => {
    console.log(values);
    if (selectedContract) {
      let _balanceOf = await makeCall("balanceOf", localContracts[selectedContract], [values.address]);
      let _allowanceOf = await makeCall("allowance", localContracts[selectedContract], [address, values.address]);
      let _myAllowanceOn = await makeCall("allowance", localContracts[selectedContract], [values.address, address]);

      setAddressAllowance(formatUnits(_allowanceOf, decimals));
      setMyAllowanceOnAddress(formatUnits(_myAllowanceOn, decimals));
      setAddressBalance(formatUnits(_balanceOf, decimals));
    }
  };

  const executeUpdateFunction = async values => {
    console.log(values);
    let parsedAmount = parseUnits(values.amount, decimals);
    let args;
    if (values.function === "transferFrom") {
      args = [values.fromAddress, values.toAddress, parsedAmount];
    } else {
      args = [values.toAddress, parsedAmount];
    }

    let selectedFunction = values.function ? values.function : defaultUpdateFunction;

    try {
      let result = await makeCall(selectedFunction, localContracts[selectedContract], args);
      console.log(result);
      notification.open({
        message: "Success",
        description: `👀 ${selectedFunction}: ${values.amount} to ${values.toAddress}`,
      });
    } catch (e) {
      notification.open({
        message: "Transaction failed",
        description: `👀 ${e.message}`,
      });
    }
  };
  const lookupArtist = async artist => {};
  const setStartingConditions = async () => {
    const flyLoAddress = "0xd9837d0b546345f2Bd5749C7Ff4Ce5035e0B7828";
    const createFlyLo = await fetch(APIURL + "/bio", {
      body: JSON.stringify({ address: flyLoAddress, bio: "Flying Lotus" }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const addBBR = await fetch(APIURL + "/create", {
      body: JSON.stringify({
        address: flyLoAddress,
        title: "Black Balloons Reprise",
        lyrics: "test test",
      }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    console.log(createFlyLo);
    console.log(addBBR);
    const flyLoResponse = await fetch(APIURL + "/artist?address=" + flyLoAddress, {
      method: "GET",
    })
      .then(function (result) {
        console.log(result);
        return result.json();
      })
      .then(function (result) {
        const getFlyLo = result;
        console.log(getFlyLo);
        const flyLoBio = getFlyLo.bio;
        console.log(getFlyLo.songs);
        const flyLoSongs = JSON.parse(getFlyLo.songs).songs;
        console.log(flyLoBio);
        console.log(flyLoSongs);
      });
  };
  const populateArtist = async () => {
    const artistResponse = await fetch(APIURL + "/artist?address=" + currentArtistAddress, {
      method: "GET",
    })
      .then(function (result) {
        console.log(result);
        return result.json();
      })
      .then(function (result) {
        if (result.bio == "No bio available") {
          setHasAccess(false);
        } else if (result != null) {
          const songs = JSON.parse(result.songs).songs;
          setHasAccess(true);
          setSongList(songs);
        }
      });
  };
  const purchaseAccess = () => {
    makeCall("transfer", localContracts[selectedContract], [currentArtistAddress, valueAmount]);
  };

  return (
    <Card style={{ maxWidth: 600, width: "100%", margin: "auto" }}>
      <Radio.Group
        options={contractOptions}
        optionType="button"
        onChange={e => {
          setTotalSupply();
          setMyBalance();
          setAddressBalance();
          setAddressAllowance();
          setMyAllowanceOnAddress();
          updateForm.resetFields();
          addressInfoForm.resetFields();
          setSelectedContract(e.target.value);
        }}
        value={selectedContract}
      />
      {selectedContract ? (
        <>
          <Divider />
          {contractTitle}
          <Paragraph copyable={{ text: localContracts[selectedContract]["address"] }}>
            {"Contract: " + localContracts[selectedContract]["address"].substring(0, 7)}
          </Paragraph>
          <p>{"TotalSupply: " + totalSupply}</p>
          <p>{"Balance: " + myBalance}</p>
          {selectedContract && localContracts[selectedContract]["mintTokens"] ? (
            <Button
              onClick={async () => {
                let result = await makeCall("mintTokens", localContracts[selectedContract]);
                console.log(result);
              }}
            >
              Mint
            </Button>
          ) : null}
          {selectedContract && localContracts[selectedContract]["burnTokens"] ? (
            <Button
              onClick={() => {
                makeCall("burnTokens", localContracts[selectedContract]);
              }}
            >
              Burn
            </Button>
          ) : null}
          {selectedContract && localContracts[selectedContract]["outstandingTokens"] ? (
            <Button
              onClick={async () => {
                let result = await makeCall("outstandingTokens", localContracts[selectedContract]);
                let formattedResult = formatUnits(result, decimals);
                notification.open({
                  message: "Tokens outstanding",
                  description: `👀 There are ${formattedResult} tokens available to claim`,
                });
              }}
            >
              GetOutstanding
            </Button>
          ) : null}
          {selectedContract && localContracts[selectedContract]["mintOutstandingTokens"] ? (
            <Button
              onClick={() => {
                makeCall("mintOutstandingTokens", localContracts[selectedContract]);
              }}
            >
              MintOutstanding
            </Button>
          ) : null}
          <Divider />
          <Button onClick={setStartingConditions}>Click Me To Try Stuff</Button>
          <Button
            onClick={() => {
              artistButton("Flying Lotus");
            }}
          >
            Flying Lotus
          </Button>
          <h2>Current Artist: {currentArtist}</h2>
          <h2>Current Artist Address: {currentArtistAddress}</h2>
          <Button onClick={populateArtist(currentArtist)}>Check Access</Button>
          <Button onClick={() => purchaseAccess()}></Button>
          <h2>{hasAccess ? "has access" : "does not have access"}</h2>
          <div style={{ margin: 8 }}>
            {/* <Title level={4}>Interact</Title> */}
            <Form
              form={updateForm}
              layout="horizontal"
              onFinish={executeUpdateFunction}
              onFinishFailed={errorInfo => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Card>
                {songList.map(string => {
                  return (
                    <Card.Grid key={string + Math.random()} style={gridStyle}>
                      {string}
                    </Card.Grid>
                  );
                })}
                {/* <Card.Grid style={gridStyle}>Test</Card.Grid>
            <Card.Grid style={gridStyle}>Test</Card.Grid>
            <Card.Grid style={gridStyle}>Test</Card.Grid>
            <Card.Grid style={gridStyle}>Test</Card.Grid>
            <Card.Grid style={gridStyle}>Test</Card.Grid>
            <Card.Grid style={gridStyle}>Test</Card.Grid> */}
              </Card>

              <Form.Item name="function">
                {/* <Radio.Group
                  options={["transfer"]} // "approve", "increaseAllowance", "decreaseAllowance", "transferFrom"
                  optionType="button"
                  onChange={e => {
                    console.log(e);
                    setUpdateFormFunction(e.target.value);
                  }}
                  defaultValue={defaultUpdateFunction}
                /> */}
              </Form.Item>
              {updateFormFunction === "transferFrom" ? (
                <Form.Item
                  name="fromAddress"
                  rules={[{ required: updateFormFunction === "transferFrom", message: "Address to transfer from" }]}
                >
                  <AddressInput placeholder="fromAddress" ensProvider={mainnetProvider} />
                </Form.Item>
              ) : null}
              <Form.Item name="toAddress" rules={[{ required: true, message: "Please enter an address" }]}>
                <AddressInput placeholder="address" ensProvider={mainnetProvider} />
              </Form.Item>
              <Form.Item name="amount" rules={[{ required: true, message: `Set the value to ${updateFormFunction}` }]}>
                <Input placeholder="amount" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
          <Divider />
          {/* <div style={{ margin: 8 }}>
            <Title level={4}>Address Info</Title>
            <Form
              form={addressInfoForm}
              layout="horizontal"
              onFinish={getAddressInfo}
              onFinishFailed={errorInfo => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Form.Item name="address">
                <AddressInput placeholder="address" layout="inline" ensProvider={mainnetProvider} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Get address info
                </Button>
              </Form.Item>
            </Form>
            {addressBalance ? <p>{`Address Balance: ${addressBalance}`}</p> : null}
            {addressAllowance ? (
              <p>{`Address Allowance on my ${selectedContract} tokens: ${addressAllowance}`}</p>
            ) : null}
            {myAllowanceOnAddress ? <p>{`My Allowance on address: ${myAllowanceOnAddress}`}</p> : null}
          </div> */}
        </>
      ) : null}
    </Card>
  );
}

export default OurApp;
