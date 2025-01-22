import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:polydiff/pages/replay-page.dart';
import 'package:polydiff/services/communication.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/user.dart';

class ReplayHistoryTable extends StatefulWidget {
  final List<MapEntry<DateTime, List<Widget>>> data;
  final String dataLabel1;
  final String dataLabel2;

  ReplayHistoryTable(
      {required this.data, required this.dataLabel1, required this.dataLabel2});

  @override
  ReplayHistoryTableState createState() => ReplayHistoryTableState();
}

class ReplayHistoryTableState extends State<ReplayHistoryTable> {
  final controller = PageController();
  final itemsPerPage = 5;
  final CommunicationService communicationService = CommunicationService();
  @override
  void initState() {
    super.initState();
    User.replayStart!.stream.listen((replay) async {
      Uint8List image1;
      Uint8List image2;
      List<Difference> diff;
      await communicationService
          .downloadGameCard(replay.gameCardId as String)
          .then((gameCard) async {
        await communicationService.downloadImage(gameCard.img1ID).then((img1) async {
          image1 = img1.bodyBytes;
          await communicationService.downloadImage(gameCard.img2ID).then((img2) {
            image2 = img2.bodyBytes;
            diff = gameCard.differences;
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) =>
                        ReplayPage(img1: image1, img2: image2, diff: diff)));
          });
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = (widget.data.length / itemsPerPage).ceil();

    return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: 300), // Set the maximum height
        child: Stack(
          children: [
            PageView.builder(
              controller: controller,
              itemCount: pages,
              itemBuilder: (context, pageIndex) {
                final firstItemIndex = pageIndex * itemsPerPage;
                final lastItemIndex =
                    min(firstItemIndex + itemsPerPage, widget.data.length);
                final pageItems = widget.data.reversed
                    .toList()
                    .sublist(firstItemIndex, lastItemIndex);

                return Column(children: [
                  Expanded(
                      flex: 2,
                      child: Center(
                          child: DataTable(
                        dataRowHeight: 40,
                        columns: [
                          DataColumn(label: Text('Date')),
                          DataColumn(label: Text(widget.dataLabel1)),
                          DataColumn(label: Text(widget.dataLabel2)),
                        ],
                        rows: pageItems
                            .map((entry) => DataRow(cells: [
                                  DataCell(Text(DateFormat('yyyy-MM-dd – kk:mm')
                                      .format(entry.key.toLocal())
                                      .toString())),
                                  DataCell(entry.value[0]),
                                  DataCell(entry.value[1])
                                ]))
                            .toList(),
                      ))),
                  Center(
                    child: Text('Page: ${pageIndex + 1} / $pages'),
                  )
                  // ),
                ]);
              },
            ),
            ArrowButton(controller, true),
            ArrowButton(controller, false),
          ],
        ));
  }
}

class ArrowButton extends StatelessWidget {
  final PageController controller;
  final bool isLeft;
  ArrowButton(this.controller, this.isLeft);

  @override
  Widget build(BuildContext context) => Positioned(
        left: isLeft ? 10 : null,
        right: isLeft ? null : 10,
        top: 0,
        bottom: 0,
        child: IconButton(
          icon: isLeft ? Icon(Icons.arrow_back) : Icon(Icons.arrow_forward),
          onPressed: () {
            isLeft
                ? controller.previousPage(
                    duration: Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  )
                : controller.nextPage(
                    duration: Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
          },
        ),
      );
}
